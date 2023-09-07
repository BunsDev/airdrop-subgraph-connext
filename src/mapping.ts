import { log, BigInt } from '@graphprotocol/graph-ts';
import { CrosschainClaim as CrosschainClaimEvent } from '../generated/Distributor/Distributor';
import { CrosschainClaim, Info } from '../generated/schema';

export function handleCrosschainClaim(event: CrosschainClaimEvent): void {
  log.debug(
    'CrosschainClaim detected. Id: {} | beneficiary: {} | recipient: {} | recipientDomain: {} | amount: {}',
    [
      event.params.id.toHexString(),
      event.params.beneficiary.toHexString(),
      event.params.recipient.toHexString(),
      event.params.recipientDomain.toString(),
      event.params.amount.toString(),
    ],
  );

  let id = event.transaction.hash
    .toHexString()
    .concat('-'.concat(event.transactionLogIndex.toString()));

  let claim = new CrosschainClaim(id);
  claim.transferId = event.params.id;
  claim.beneficiary = event.params.beneficiary;
  claim.recipient = event.params.recipient;
  claim.recipientDomain = event.params.recipientDomain;
  claim.amount = event.params.amount;

  claim.caller = event.transaction.from;
  claim.timestamp = event.block.timestamp;
  claim.blockNumber = event.block.number;
  claim.transactionHash = event.transaction.hash;
  claim.gasPrice = event.transaction.gasPrice;
  claim.gasLimit = event.transaction.gasLimit;

  claim.save();

  let info = Info.load('1');
  if (info == null) {
    info = new Info('1');
    info.totalCount = BigInt.fromI32(0);
    info.totalAmount = BigInt.fromI32(0);
  }

  info.totalCount = info.totalCount!.plus(BigInt.fromI32(1));
  info.totalAmount = info.totalAmount!.plus(event.params.amount);
  info.save();
}
