import { Product } from '@influenceth/sdk'
import { z } from 'zod'

const timestamp = z.number().transform((v) => new Date(v * 1000))
export const activitySchema = z.object({
  event: z.discriminatedUnion('name', [
    z.object({
      name: z.literal('MaterialProcessingFinished'),
      timestamp,
      returnValues: z.object({
        callerCrew: z.object({ id: z.number() }),
        processor: z.object({ id: z.number() }),
        processorSlot: z.number(),
      }),
    }),
    z.object({
      name: z.literal('SellOrderFilled'),
      timestamp,
      returnValues: z.object({
        callerCrew: z.object({ id: z.number() }),
        sellerCrew: z.object({ id: z.number() }),
        product: z.number().transform(Product.getType),
        amount: z.number(),
        price: z.number(),
      }),
    }),
    z.object({
      name: z.literal('PublicPolicyAssigned'),
      timestamp,
    }),
    z.object({
      name: z.literal('SurfaceScanStarted'),
      timestamp,
    }),
    z.object({
      name: z.literal('ConstructionStarted'),
      timestamp,
    }),
    z.object({
      name: z.literal('MaterialProcessingStarted'),
      timestamp,
    }),
    z.object({
      name: z.literal('PrepaidAgreementAccepted'),
      timestamp,
    }),
    z.object({
      name: z.literal('PrepaidAgreementExtended'),
      timestamp,
    }),
    z.object({
      name: z.literal('RemovedFromWhitelist'),
      timestamp,
    }),
    z.object({
      name: z.literal('SamplingDepositStarted'),
      timestamp,
    }),
    z.object({
      name: z.literal('SellOrderCreated'),
      timestamp,
    }),
    z.object({
      name: z.literal('AsteroidManaged'),
      timestamp,
    }),
    z.object({
      name: z.literal('AsteroidPurchased'),
      timestamp,
    }),
    z.object({
      name: z.literal('AsteroidScanned'),
      timestamp,
    }),
    z.object({
      name: z.literal('BuildingRepossessed'),
      timestamp,
    }),
    z.object({
      name: z.literal('BuyOrderFilled'),
      timestamp,
    }),
    z.object({
      name: z.literal('BuyOrderCreated'),
      timestamp,
    }),
    z.object({
      name: z.literal('ConstructionPlanned'),
      timestamp,
    }),
    z.object({
      name: z.literal('ConstructionAbandoned'),
      timestamp,
    }),
    z.object({
      name: z.literal('ConstructionFinished'),
      timestamp,
    }),
    z.object({
      name: z.literal('ConstructionDeconstructed'),
      timestamp,
    }),
    z.object({
      name: z.literal('CrewDelegated'),
      timestamp,
    }),
    z.object({
      name: z.literal('CrewFormed'),
      timestamp,
    }),
    z.object({
      name: z.literal('CrewmatePurchased'),
      timestamp,
    }),
    z.object({
      name: z.literal('CrewmateRecruited'),
      timestamp,
    }),
    z.object({
      name: z.literal('CrewmatesArranged'),
      timestamp,
    }),
    z.object({
      name: z.literal('CrewmatesExchanged'),
      timestamp,
    }),
    z.object({
      name: z.literal('CrewEjected'),
      timestamp,
    }),
    z.object({
      name: z.literal('CrewStationed'),
      timestamp,
    }),
    z.object({
      name: z.literal('DeliveryFinished'),
      timestamp,
    }),
    z.object({
      name: z.literal('AddedToWhitelist'),
      timestamp,
    }),
    z.object({
      name: z.literal('DeliverySent'),
      timestamp,
    }),
    z.object({
      name: z.literal('DeliveryReceived'),
      timestamp,
    }),
    z.object({
      name: z.literal('EmergencyActivated'),
      timestamp,
    }),
    z.object({
      name: z.literal('EmergencyDeactivated'),
      timestamp,
    }),
    z.object({
      name: z.literal('EmergencyPropellantCollected'),
      timestamp,
    }),
    z.object({
      name: z.literal('FoodSupplied'),
      timestamp,
    }),
    z.object({
      name: z.literal('ArrivalRewardClaimed'),
      timestamp,
    }),
    z.object({
      name: z.literal('PrepareForLaunchRewardClaimed'),
      timestamp,
    }),
    z.object({
      name: z.literal('NameChanged'),
      timestamp,
    }),
    z.object({
      name: z.literal('RandomEventResolved'),
      timestamp,
    }),
    z.object({
      name: z.literal('ResourceExtractionStarted'),
      timestamp,
    }),
    z.object({
      name: z.literal('ResourceExtractionFinished'),
      timestamp,
    }),
    z.object({
      name: z.literal('ResourceScanFinished'),
      timestamp,
    }),
    z.object({
      name: z.literal('SamplingDepositFinished'),
      timestamp,
    }),
    z.object({
      name: z.literal('ShipAssemblyFinished'),
      timestamp,
    }),
    z.object({
      name: z.literal('ShipDocked'),
      timestamp,
    }),
    z.object({
      name: z.literal('ShipUndocked'),
      timestamp,
    }),
    z.object({
      name: z.literal('SurfaceScanFinished'),
      timestamp,
    }),
    z.object({
      name: z.literal('Transfer'),
      timestamp,
    }),
    z.object({
      name: z.literal('TransitStarted'),
      timestamp,
    }),
    z.object({
      name: z.literal('TransitFinished'),
      timestamp,
    }),
    z.object({
      name: z.literal('ShipCommandeered'),
      timestamp,
    }),
    z.object({
      name: z.literal('DepositListedForSale'),
      timestamp,
    }),
    z.object({
      name: z.literal('DepositUnlistedForSale'),
      timestamp,
    }),
    z.object({
      name: z.literal('DepositPurchased'),
      timestamp,
    }),
  ]),
})
