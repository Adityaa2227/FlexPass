// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract FlexPass is ERC721, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    IERC20 public immutable usdcToken;
    
    struct Provider {
        string name;
        string logoUrl;
        uint256 hourlyRate; // USDC rate per hour (6 decimals)
        bool isActive;
    }
    
    struct Pass {
        uint256 providerId;
        uint256 expirationTime;
        uint256 pricePaid;
        bool isActive;
        string transactionHash;
    }
    
    mapping(uint256 => Pass) public passes;
    mapping(uint256 => Provider) public providers;
    mapping(address => mapping(uint256 => uint256)) public activePassByProvider; // user => providerId => tokenId
    
    uint256 public nextProviderId = 1;
    
    event PassPurchased(address indexed user, uint256 indexed tokenId, uint256 indexed providerId, uint256 expirationTime, uint256 price);
    event PassRevoked(uint256 indexed tokenId);
    event PassExtended(uint256 indexed tokenId, uint256 newExpirationTime);
    event ProviderAdded(uint256 indexed providerId, string name, uint256 hourlyRate);
    event ProviderUpdated(uint256 indexed providerId, string name, uint256 hourlyRate);
    
    constructor(address _usdcToken) ERC721("FlexPass", "FLEX") {
        usdcToken = IERC20(_usdcToken);
        
        // Initialize default providers
        _addProvider("ChatGPT", "https://cdn.openai.com/API/logo-openai.svg", 1000000); // $1/hour
        _addProvider("Spotify", "https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_CMYK_Green.png", 500000); // $0.50/hour
        _addProvider("Netflix", "https://assets.brand.microsites.netflix.io/assets/2800a67c-4252-11ec-a9ce-066b49664af6_cm_800w.jpg", 2000000); // $2/hour
        _addProvider("Kindle", "https://m.media-amazon.com/images/G/01/kindle/dp/2017/4911315144/LP_AG_HERO_LOGO_KINDLE._CB514508846_.png", 750000); // $0.75/hour
    }
    
    function buyPass(uint256 _providerId, uint256 _durationSeconds) external returns (uint256) {
        require(providers[_providerId].isActive, "Provider not active");
        require(_durationSeconds > 0, "Duration must be positive");
        require(activePassByProvider[msg.sender][_providerId] == 0, "Active pass already exists for this provider");
        
        uint256 durationHours = (_durationSeconds + 3599) / 3600; // Round up to nearest hour
        uint256 totalPrice = providers[_providerId].hourlyRate * durationHours;
        
        require(usdcToken.transferFrom(msg.sender, address(this), totalPrice), "USDC transfer failed");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        uint256 expirationTime = block.timestamp + _durationSeconds;
        
        passes[newTokenId] = Pass({
            providerId: _providerId,
            expirationTime: expirationTime,
            pricePaid: totalPrice,
            isActive: true,
            transactionHash: ""
        });
        
        activePassByProvider[msg.sender][_providerId] = newTokenId;
        
        _mint(msg.sender, newTokenId);
        
        emit PassPurchased(msg.sender, newTokenId, _providerId, expirationTime, totalPrice);
        
        return newTokenId;
    }
    
    function isValid(uint256 _tokenId) external view returns (bool) {
        require(_exists(_tokenId), "Pass does not exist");
        Pass memory pass = passes[_tokenId];
        return pass.isActive && block.timestamp < pass.expirationTime;
    }
    
    function activePassByProvider(address _user, uint256 _providerId) external view returns (uint256) {
        uint256 tokenId = activePassByProvider[_user][_providerId];
        if (tokenId == 0) return 0;
        
        Pass memory pass = passes[tokenId];
        if (!pass.isActive || block.timestamp >= pass.expirationTime) {
            return 0;
        }
        
        return tokenId;
    }
    
    function extendPass(uint256 _tokenId, uint256 _additionalSeconds) external {
        require(ownerOf(_tokenId) == msg.sender, "Not pass owner");
        require(passes[_tokenId].isActive, "Pass not active");
        
        uint256 providerId = passes[_tokenId].providerId;
        uint256 additionalHours = (_additionalSeconds + 3599) / 3600;
        uint256 extensionPrice = providers[providerId].hourlyRate * additionalHours;
        
        require(usdcToken.transferFrom(msg.sender, address(this), extensionPrice), "USDC transfer failed");
        
        passes[_tokenId].expirationTime += _additionalSeconds;
        passes[_tokenId].pricePaid += extensionPrice;
        
        emit PassExtended(_tokenId, passes[_tokenId].expirationTime);
    }
    
    function revokePass(uint256 _tokenId) external {
        require(ownerOf(_tokenId) == msg.sender, "Not pass owner");
        require(passes[_tokenId].isActive, "Pass already inactive");
        
        passes[_tokenId].isActive = false;
        activePassByProvider[msg.sender][passes[_tokenId].providerId] = 0;
        
        emit PassRevoked(_tokenId);
    }
    
    function getPassDetails(uint256 _tokenId) external view returns (
        uint256 providerId,
        uint256 expirationTime,
        uint256 pricePaid,
        bool isActive,
        bool isValid,
        string memory transactionHash
    ) {
        require(_exists(_tokenId), "Pass does not exist");
        Pass memory pass = passes[_tokenId];
        bool valid = pass.isActive && block.timestamp < pass.expirationTime;
        
        return (
            pass.providerId,
            pass.expirationTime,
            pass.pricePaid,
            pass.isActive,
            valid,
            pass.transactionHash
        );
    }
    
    function getUserPasses(address _user) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(_user);
        uint256[] memory userTokens = new uint256[](balance);
        
        uint256 index = 0;
        for (uint256 i = 1; i <= _tokenIds.current(); i++) {
            if (_exists(i) && ownerOf(i) == _user) {
                userTokens[index] = i;
                index++;
            }
        }
        
        return userTokens;
    }
    
    function _addProvider(string memory _name, string memory _logoUrl, uint256 _hourlyRate) internal {
        providers[nextProviderId] = Provider({
            name: _name,
            logoUrl: _logoUrl,
            hourlyRate: _hourlyRate,
            isActive: true
        });
        
        emit ProviderAdded(nextProviderId, _name, _hourlyRate);
        nextProviderId++;
    }
    
    function addProvider(string memory _name, string memory _logoUrl, uint256 _hourlyRate) external onlyOwner {
        _addProvider(_name, _logoUrl, _hourlyRate);
    }
    
    function updateProvider(uint256 _providerId, string memory _name, string memory _logoUrl, uint256 _hourlyRate) external onlyOwner {
        require(_providerId > 0 && _providerId < nextProviderId, "Invalid provider ID");
        
        providers[_providerId].name = _name;
        providers[_providerId].logoUrl = _logoUrl;
        providers[_providerId].hourlyRate = _hourlyRate;
        
        emit ProviderUpdated(_providerId, _name, _hourlyRate);
    }
    
    function toggleProvider(uint256 _providerId) external onlyOwner {
        require(_providerId > 0 && _providerId < nextProviderId, "Invalid provider ID");
        providers[_providerId].isActive = !providers[_providerId].isActive;
    }
    
    function withdraw() external onlyOwner {
        uint256 balance = usdcToken.balanceOf(address(this));
        require(balance > 0, "No USDC to withdraw");
        
        require(usdcToken.transfer(owner(), balance), "USDC transfer failed");
    }
    
    function getProvider(uint256 _providerId) external view returns (
        string memory name,
        string memory logoUrl,
        uint256 hourlyRate,
        bool isActive
    ) {
        require(_providerId > 0 && _providerId < nextProviderId, "Invalid provider ID");
        Provider memory provider = providers[_providerId];
        
        return (provider.name, provider.logoUrl, provider.hourlyRate, provider.isActive);
    }
    
    function getAllProviders() external view returns (uint256[] memory) {
        uint256[] memory providerIds = new uint256[](nextProviderId - 1);
        for (uint256 i = 1; i < nextProviderId; i++) {
            providerIds[i - 1] = i;
        }
        return providerIds;
    }
}
