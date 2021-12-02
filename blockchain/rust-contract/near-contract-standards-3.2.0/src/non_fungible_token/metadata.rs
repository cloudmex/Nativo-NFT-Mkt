use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::json_types::Base64VecU8;
use near_sdk::serde::{Deserialize, Serialize};

/// This spec can be treated like a version of the standard.
pub const NFT_METADATA_SPEC: &str = "nft-1.0.0";

/// Metadata for the NFT contract itself.
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone, Debug, PartialEq)]
#[serde(crate = "near_sdk::serde")]
pub struct NFTContractMetadata {
    pub spec: String,              // required, essentially a version like "nft-1.0.0"
    pub name: String,              // required, ex. "Mosaics"
    pub symbol: String,            // required, ex. "MOSIAC"
    pub icon: Option<String>,      // Data URL
    pub base_uri: Option<String>, // Centralized gateway known to have reliable access to decentralized storage assets referenced by `reference` or `media` URLs
    pub reference: Option<String>, // URL to a JSON file with more info
    pub reference_hash: Option<Base64VecU8>, // Base64-encoded sha256 hash of JSON from reference field. Required if `reference` is included.
}
use near_sdk::collections::LookupMap;
use near_sdk::{env, near_bindgen};

near_sdk::setup_alloc!();
/// Metadata on the individual token level.
#[derive(BorshDeserialize, BorshSerialize)]
pub struct OldTokenMetadata {
    pub title: Option<String>, // ex. "Arch Nemesis: Mail Carrier" or "Parcel #5055"
    pub description: Option<String>, // free-form description
    pub media: Option<String>, // URL to associated media, preferably to decentralized, content-addressed storage
    pub media_hash: Option<Base64VecU8>, // Base64-encoded sha256 hash of content referenced by the `media` field. Required if `media` is included.
    pub copies: Option<u64>, // number of copies of this set of metadata in existence when token was minted.
    pub issued_at: Option<String>, // ISO 8601 datetime when token was issued or minted
    pub price: Option<String>, // is the price in yoctos
    pub culture: Option<String>, // is the culture
    pub country: Option<String>, // is the country
    pub on_sale: Option<bool>, // sale status
    pub on_auction: Option<bool>, //auction status
    pub adressbidder: Option<String>, //
    pub highestbidder: Option<String>,
    pub lowestbidder: Option<String>,
    pub expires_at: Option<String>, // ISO 8601 datetime when token expires
    pub starts_at: Option<String>, // ISO 8601 datetime when token starts being valid
    pub updated_at: Option<String>, // ISO 8601 datetime when token was last updated
    pub extra: Option<String>, // anything extra the NFT wants to store on-chain. Can be stringified JSON.
    pub reference: Option<String>, // URL to an off-chain JSON file with more info.
    pub reference_hash: Option<Base64VecU8>, // Base64-encoded sha256 hash of JSON from reference field. Required if `reference` is included.
}

/// Metadata on the individual token level.

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
 pub struct TokenMetadata {
    pub title: Option<String>, // ex. "Arch Nemesis: Mail Carrier" or "Parcel #5055"
    pub description: Option<String>, // free-form description
    pub media: Option<String>, // URL to associated media, preferably to decentralized, content-addressed storage
    pub media_hash: Option<Base64VecU8>, // Base64-encoded sha256 hash of content referenced by the `media` field. Required if `media` is included.
    pub copies: Option<u64>, // number of copies of this set of metadata in existence when token was minted.
    pub issued_at: Option<String>, // ISO 8601 datetime when token was issued or minted
    pub price: Option<String>, // is the price in yoctos
    pub culture: Option<String>, // is the culture
    pub country: Option<String>, // is the country
    pub creator: Option<String>, // is the creator
    pub on_sale: Option<bool>, // sale status
    pub expires_at: Option<String>, // ISO 8601 datetime when token expires
    pub starts_at: Option<String>, // ISO 8601 datetime when token starts being valid
    pub updated_at: Option<String>, // ISO 8601 datetime when token was last updated
    pub extra: Option<String>, // anything extra the NFT wants to store on-chain. Can be stringified JSON.
    pub reference: Option<String>, // URL to an off-chain JSON file with more info.
    pub reference_hash: Option<Base64VecU8>, // Base64-encoded sha256 hash of JSON from reference field. Required if `reference` is included.
}


/// Offers details on the contract-level metadata.
pub trait NonFungibleTokenMetadataProvider {
    fn nft_metadata(&self) -> NFTContractMetadata;
}

impl NFTContractMetadata {
    pub fn assert_valid(&self) {
        assert_eq!(&self.spec, NFT_METADATA_SPEC);
        assert_eq!(self.reference.is_some(), self.reference_hash.is_some());
        if let Some(reference_hash) = &self.reference_hash {
            assert_eq!(reference_hash.0.len(), 32, "Hash has to be 32 bytes");
        }
    }
}

#[near_bindgen]
impl TokenMetadata {
    pub fn assert_valid(&self) {
        assert_eq!(self.media.is_some(), self.media_hash.is_some());
        if let Some(media_hash) = &self.media_hash {
            assert_eq!(media_hash.0.len(), 32, "Media hash has to be 32 bytes");
        }

        assert_eq!(self.reference.is_some(), self.reference_hash.is_some());
        if let Some(reference_hash) = &self.reference_hash {
            assert_eq!(
                reference_hash.0.len(),
                32,
                "Reference hash has to be 32 bytes"
            );
        }
    }

    #[private]
    #[init(ignore_state)]
    pub fn migrate() -> Self {
        let old_state: OldTokenMetadata = env::state_read().expect("failed");
        Self {
           
              title: old_state.title, // ex. "Arch Nemesis: Mail Carrier" or "Parcel #5055"
              description:old_state.description, // free-form description
              media: old_state.media, // URL to associated media, preferably to decentralized, content-addressed storage
              media_hash:old_state.media_hash, // Base64-encoded sha256 hash of content referenced by the `media` field. Required if `media` is included.
              copies: old_state.copies, // number of copies of this set of metadata in existence when token was minted.
              issued_at: old_state.issued_at, // ISO 8601 datetime when token was issued or minted
              price: old_state.price, // is the price in yoctos
              culture: old_state.culture, // is the culture
              country: old_state.country, // is the country
              creator: Some("a".repeat(64)), // is the creator
              on_sale: old_state.on_sale, // sale status
              expires_at: old_state.expires_at, // ISO 8601 datetime when token expires
              starts_at: old_state.starts_at, // ISO 8601 datetime when token starts being valid
              updated_at: old_state.updated_at, // ISO 8601 datetime when token was last updated
              extra: old_state.extra, // anything extra the NFT wants to store on-chain. Can be stringified JSON.
              reference: old_state.reference, // URL to an off-chain JSON file with more info.
              reference_hash: old_state.reference_hash,
        }
    }


}

