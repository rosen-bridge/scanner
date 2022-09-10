import { ErgoObservationExtractor } from "./ergoExtractor";
import { CardanoObservationExtractor } from "./cardanoExtractor";
import { RosenTokens } from "@rosen-bridge/tokens";

export const tokens: RosenTokens = {
    idKeys: {
        ergo: "tokenId",
        cardano: "fingerprint",
    },
    tokens: [
        {
            [ErgoObservationExtractor.FROM_CHAIN]: {
                tokenId: "ergo",
            },
            [CardanoObservationExtractor.FROM_CHAIN]: {
                fingerprint: "fingerPrint",
                policyId: "ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2",
                assetName: "7369676d61",
            }
        },
        {
            [ErgoObservationExtractor.FROM_CHAIN]: {
                tokenId: "f6a69529b12a7e2326acffee8383e0c44408f87a872886fadf410fe8498006d3",
                id: "f6a69529b12a7e2326acffee8383e0c44408f87a872886fadf410fe8498006d3",
                idKey: "fingerprint"
            },
            [CardanoObservationExtractor.FROM_CHAIN]: {
                fingerprint: "cardano",
                tokenId: "cardano",
                id: "cardano"
            }
        }
    ]
}
