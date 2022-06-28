export const mintNFT = 
`
import BullnBear from 0x0891c3a59894a20c 
import NonFungibleToken from 0x631e88ae7f1d7c20
import MetadataViews from 0x631e88ae7f1d7c20

transaction(
  recipient: Address,
  name: String,
  description: String,
  thumbnail: String,
) {
  prepare(signer: AuthAccount) {
    if signer.borrow<&BullnBear.Collection>(from: BullnBear.CollectionStoragePath) != nil {
      return
    }

    // Create a new empty collection
    let collection <- BullnBear.createEmptyCollection()

    // save it to the account
    signer.save(<-collection, to: BullnBear.CollectionStoragePath)

    // create a public capability for the collection
    signer.link<&{NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection}>(
      BullnBear.CollectionPublicPath,
      target: BullnBear.CollectionStoragePath
    )
  }


  execute {
    // Borrow the recipient's public NFT collection reference
    let receiver = getAccount(recipient)
      .getCapability(BullnBear.CollectionPublicPath)
      .borrow<&{NonFungibleToken.CollectionPublic}>()
      ?? panic("Could not get receiver reference to the NFT Collection")

    // Mint the NFT and deposit it to the recipient's collection
    BullnBear.mintNFT(
      recipient: receiver,
      name: name,
      description: description,
      thumbnail: thumbnail,
    )
    
    log("Minted an NFT and stored it into the collection")
  } 
}
`