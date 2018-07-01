# Blockchain OTC Market - Parity Example Setup

## Warning

**This example includes the credentials and key of the engine signer!
Don't use this configuration in a production environment!**

## Setup

Download and install [Parity](https://github.com/paritytech/parity/releases/tag/v1.9.6) 1.9.6-stable binary.

## Configuration Files

### Chain Configuration File `./chain.json`

```
{
  "name": "BlockchainDemo",
  "engine": {
    "authorityRound": {
      "params": {
        "stepDuration": "5",
        "validators": { "list": [ "0x00bd138abd70e2f00903268f3db08f2d25677c9e" ] }
      }
    }
  },
  "params": {
    "gasLimitBoundDivisor": "0x400",
    "maximumExtraDataSize": "0x20",
    "minGasLimit": "0x1388",
    "networkID": "0x2323"
  },
  "genesis": {
    "seal": {
      "authorityRound": {
        "step": "0x0",
        "signature": "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
      }
    },
    "difficulty": "0x20000",
    "gasLimit": "0x5B8D80"
  },
  "accounts": {
    "0x0000000000000000000000000000000000000001": {
      "balance": "1",
      "builtin": { "name": "ecrecover", "pricing": { "linear": { "base": 3000, "word": 0 } } }
    },
    "0x0000000000000000000000000000000000000002": {
      "balance": "1",
      "builtin": { "name": "sha256", "pricing": { "linear": { "base": 60, "word": 12 } } }
    },
    "0x0000000000000000000000000000000000000003": {
      "balance": "1",
      "builtin": { "name": "ripemd160", "pricing": { "linear": { "base": 600, "word": 120 } } }
    },
    "0x0000000000000000000000000000000000000004": {
      "balance": "1",
      "builtin": { "name": "identity", "pricing": { "linear": { "base": 15, "word": 3 } } }
    }
  }
}
```

### Parity Node Configuration File `./node0.toml`

See [Configuring Parity](https://wiki.parity.io/Configuring-Parity#default-configtoml)
for the default configuration and further information.

If the [backend](../README.md) is not executed on the same system as the parity node
the `interface`, `cors`, `origin` and `hosts` entries of the `[rpc]` and `[websockets]`
sections have to set accordingly.

```
[parity]
chain = "chain.json"
base_path = "data/parity0"

[account]
password = ["node0.pwd"]

[ui]
disable = true

[rpc]
disable = false
port = 8545
interface = "local"
cors = []
hosts = ["none"]

[websockets]
disable = false
port = 8546
interface = "local"
origins = ["none"]
hosts = ["none"]

[ipc]
disable = true

[mining]
engine_signer = "0x00bd138abd70e2f00903268f3db08f2d25677c9e"
reseal_on_txs = "none"
usd_per_tx = "0"
```

### Password File `./node0.pwd`

```
node0
```

### Signer Key File `./data/parity0/keys/BlockchainDemo/signer-account`

```
{"id":"b2abab78-a4a8-02ee-c50f-f1e997b92ddd","version":3,"crypto":{"cipher":"aes-128-ctr","cipherparams":{"iv":"e9e2d698b00b34d4e605b0af7d8be76c"},"ciphertext":"35f8cf73ac123fbb552f64dd5cfc0176661eabd65379d3ff9c9b121013268f99","kdf":"pbkdf2","kdfparams":{"c":10240,"dklen":32,"prf":"hmac-sha256","salt":"bc28777585c600f5d518f69cc88557e3c3042208ec7e7b3112ada7f4b41fd604"},"mac":"7eec0c3acae46dec3e9e8b8c068ba370c15c9f4297bad15d350786d642c7baa5"},"address":"00bd138abd70e2f00903268f3db08f2d25677c9e","name":"node0","meta":"{}"}
```

## Startup

```
$ parity --config node0.toml
```
