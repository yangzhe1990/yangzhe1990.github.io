const forwarderOrigin = 'http://localhost:9010'

const isConfluxPortalInstalled = () => {
  return Boolean(window.conflux && window.conflux.isConfluxPortal)
}

const CFX = BigInt(1e18)

const from_float = (bint) => {
  const native_bint = BigInt(bint.toString())
  const reminders = native_bint % CFX
  const cfx = (native_bint - reminders) / CFX
  const reminders_padded = reminders.toString().padStart(18, '0')
  return `${cfx}.${reminders_padded}`
}

const initialize = () => {
  // util function
  to_bint = ConfluxJSSDK.util.format.bigUInt
  from_bint = ConfluxJSSDK.util.format.hexUInt

  const onboardButton = document.getElementById('connectButton')
  const balanceText = document.getElementById('balance')
  const stakingBalanceText = document.getElementById('staking_balance')
  const cfxDepositButton = document.getElementById('cfxDeposit')
  const cfxDepositAmount = document.getElementById('cfxDepositAmount')
  const cfxWithdrawButton = document.getElementById('cfxWithdraw')
  const cfxWithdrawAmount = document.getElementById('cfxWithdrawAmount')
  const cfxWithdrawAllButton = document.getElementById('cfxWithdrawAll')

  const personalSignData = document.getElementById('personalSignData')
  const personalSignDataResults = document.getElementById(
    'personalSignDataResult'
  )
  const signTypedData = document.getElementById('signTypedData')
  const signTypedDataResults = document.getElementById('signTypedDataResult')
  const sendSignedTypedData = document.getElementById('sendSignedTypedData')
  const sendSignedTypedDataResult = document.getElementById(
    'sendSignedTypedDataResult'
  )
  const cfxSignData = document.getElementById('cfxSignData')
  const cfxSignDataResults = document.getElementById('cfxSignDataResult')
  const getAccountsButton = document.getElementById('getAccounts')
  const getAccountsResults = document.getElementById('getAccountsResult')

  const tokenAddress = document.getElementById('tokenAddress')
  const networkDiv = document.getElementById('network')
  const chainIdDiv = document.getElementById('chainId')
  const accountsDiv = document.getElementById('accounts')

  let onboarding
  try {
    // https://github.com/yqrashawn/conflux-portal-onboarding/blob/master/src/index.js
    onboarding = new ConfluxPortalOnboarding({ forwarderOrigin })
  } catch (error) {
    console.error(error)
  }
  let accounts

  const isConfluxPortalConnected = () => accounts && accounts.length > 0

  const onClickInstall = () => {
    onboardButton.innerText = 'Onboarding in progress'
    onboardButton.disabled = true
    // https://github.com/yqrashawn/conflux-portal-onboarding/blob/master/src/index.js#L109
    onboarding.startOnboarding()
  }

  const onClickConnect = async () => {
    await window.conflux.enable()
  }

  const updateButtons = () => {
    if (isConfluxPortalInstalled() && isConfluxPortalConnected()) {
      personalSignData.disabled = false
      cfxSignData.disabled = false
      signTypedData.disabled = false
    }

    if (!isConfluxPortalInstalled()) {
      onboardButton.innerText = 'Click here to install ConfluxPortal!'
      onboardButton.onclick = onClickInstall
      onboardButton.disabled = false
    } else if (isConfluxPortalConnected()) {
      onboardButton.innerText = 'Connected'
      onboardButton.disabled = true
      if (onboarding) {
        onboarding.stopOnboarding()
      }
    } else {
      onboardButton.innerText = 'Connect'
      onboardButton.onclick = onClickConnect
      onboardButton.disabled = false
    }
  }

  const asyncIntervals = [];

  const runAsyncInterval = async (cb, interval, intervalIndex) => {
    await cb();
    if (asyncIntervals[intervalIndex]) {
      setTimeout(() => runAsyncInterval(cb, interval, intervalIndex), interval);
    }
  };

  const setAsyncInterval = (cb, interval) => {
    if (cb && typeof cb === "function") {
      const intervalIndex = asyncIntervals.length;
      asyncIntervals.push(true);
      runAsyncInterval(cb, interval, intervalIndex);
      return intervalIndex;
    } else {
      throw new Error('Callback must be a function');
    }
  };

  const clearAsyncInterval = (intervalIndex) => {
    if (asyncIntervals[intervalIndex]) {
      asyncIntervals[intervalIndex] = false;
    }
  };
  const initDisplayBalances = () => {
    setAsyncInterval(async () => {
      if (isConfluxPortalConnected()) {
        balance = from_float(await confluxJS.getBalance(accounts[0]))
        balanceText.innerText = balance
        if (cfxDepositAmount.value == 0) {
          cfxDepositAmount.value = BigInt(balance.split('.')[0])
        }
        var account = await sdk.provider.call("cfx_getAccount", accounts[0])
        var stakingBalanceHex = account.stakingBalance
        var accumulatedInterestReturnHex = account.accumulatedInterestReturn
        var stakingBalance = from_float(to_bint(stakingBalanceHex))
        stakingBalanceText.innerText = stakingBalance
        if (cfxWithdrawAmount.value == 0) {
          cfxWithdrawAmount.value = BigInt(stakingBalance.split('.')[0])
        }
      }
    }, 1000)
  }

  const initCFXDirectDepositButtons = () => {
    stakingInternalContract = confluxJS.Contract({
      "abi": [
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            }
          ],
          "name": "deposit",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "user",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "blockNumber",
              "type": "uint256"
            }
          ],
          "name": "getLockedStakingBalance",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "user",
              "type": "address"
            }
          ],
          "name": "getStakingBalance",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "user",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "blockNumber",
              "type": "uint256"
            }
          ],
          "name": "getVotePower",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "unlockBlockNumber",
              "type": "uint256"
            }
          ],
          "name": "voteLock",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            }
          ],
          "name": "withdraw",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ],
      "bytecode": "608060405234801561001057600080fd5b5061026e806100206000396000f3fe608060405234801561001057600080fd5b50600436106100625760003560e01c80632e1a7d4d1461006757806344a51d6d14610095578063b04ef9c2146100cd578063b3657ee714610125578063b6b55f2514610187578063c90abac8146101b5575b600080fd5b6100936004803603602081101561007d57600080fd5b8101908080359060200190929190505050610217565b005b6100cb600480360360408110156100ab57600080fd5b81019080803590602001909291908035906020019092919050505061021a565b005b61010f600480360360208110156100e357600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919050505061021e565b6040518082815260200191505060405180910390f35b6101716004803603604081101561013b57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610225565b6040518082815260200191505060405180910390f35b6101b36004803603602081101561019d57600080fd5b810190808035906020019092919050505061022d565b005b610201600480360360408110156101cb57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610230565b6040518082815260200191505060405180910390f35b50565b5050565b6000919050565b600092915050565b50565b60009291505056fea26469706673582212205c6c4fe7b39944b834c1d42369acca663bfaed5aa3faf2554f4ca120bfa3fc5564736f6c63430006060033"
    })
    stakingInternalContract.address = '0x0888000000000000000000000000000000000002'
    cfxDepositButton.onclick = async () => {
      console.log(cfxDepositAmount.value)
      amount = BigInt(cfxDepositAmount.value)
      const depositResult = await stakingInternalContract.deposit((amount * CFX).toString()).sendTransaction({
        value: 0,
        from: accounts[0],
        gasPrice: 1,
      })
          .confirmed()
      console.log(depositResult)
    }
    cfxWithdrawButton.onclick = async () => {
      console.log(cfxWithdrawAmount.value)
      amount = BigInt(cfxWithdrawAmount.value)
      const withdrawResult = await stakingInternalContract.withdraw((amount * CFX).toString()).sendTransaction({
        value: 0,
        from: accounts[0],
        gasPrice: 1,
      })
          .confirmed()
      console.log(withdrawResult)
    }
    cfxWithdrawAllButton.onclick = async () => {
      console.log("withdraw all: ", stakingBalanceHex)
      const withdrawResult = await stakingInternalContract.withdraw(stakingBalanceHex).sendTransaction({
        value: 0,
        from: accounts[0],
        gasPrice: 1,
      })
          .confirmed()
      console.log(withdrawResult)
    }
  }

  const initializeAccountButtons = () => {
    personalSignData.addEventListener('click', () => {
      const personalSignData = 'personal sign data'

      confluxJS.provider.sendAsync(
        {
          method: 'personal_sign',
          params: [personalSignData, conflux.selectedAddress],
          from: conflux.selectedAddress,
        },
        (err, result) => {
          if (err) {
            console.log(err)
          } else {
            if (result.warning) {
              console.warn(result.warning)
            }
            personalSignDataResults.innerHTML = JSON.stringify(result)
          }
        }
      )
    })

    cfxSignData.addEventListener('click', () => {
      const sampleData = 'sample cfx_sign data'

      confluxJS.provider.sendAsync(
        {
          method: 'cfx_sign',
          params: [conflux.selectedAddress, keccak256.digest(sampleData)],
          from: conflux.selectedAddress,
        },
        (err, result) => {
          if (err) {
            console.log(err)
          } else {
            if (result.warning) {
              console.warn(result.warning)
            }
            cfxSignDataResults.innerHTML = JSON.stringify(result)
          }
        }
      )
    })

    signTypedData.addEventListener('click', () => {
      const networkId = parseInt(networkDiv.innerHTML)
      const chainId = parseInt(chainIdDiv.innerHTML) || networkId

      const typedData = {
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
          ],
          Person: [
            { name: 'name', type: 'string' },
            { name: 'wallet', type: 'address' },
            { name: 'happy', type: 'bool' },
          ],
          Mail: [
            { name: 'from', type: 'Person' },
            { name: 'to', type: 'Person' },
            { name: 'contents', type: 'string' },
          ],
        },
        primaryType: 'Mail',
        domain: {
          name: 'Ether Mail',
          version: '1',
          chainId,
          verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        },
        message: {
          from: {
            happy: true,
            name: 'Cow',
            wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
          },
          to: {
            happy: false,
            name: 'Bob',
            wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
          },
          contents: 'Hello, Bob!',
        },
      }

      confluxJS.provider.sendAsync(
        {
          method: 'cfx_signTypedData_v4',
          params: [conflux.selectedAddress, JSON.stringify(typedData)],
          from: conflux.selectedAddress,
        },
        (err, result) => {
          if (err) {
            console.log(err)
            if (!chainId) {
              console.log('chainId is not defined')
            }
          } else {
            signTypedDataResults.innerHTML = JSON.stringify(result)
            sendSignedTypedData.disabled = false
          }
        }
      )
    })
    sendSignedTypedData.addEventListener('click', async () => {
      const signedData = JSON.parse(signTypedDataResults.innerHTML).result
      const txResult = await confluxJS
        .sendTransaction({
          from: accounts[0],
          to: accounts[0],
          data: signedData,
          gasPrice: 1,
        })
        .confirmed()
      sendSignedTypedDataResult.innerText = JSON.stringify(txResult, 2)
    })

    getAccountsButton.addEventListener('click', async () => {
      try {
        const accounts = await conflux.send({ method: 'cfx_accounts' })
        getAccountsResults.innerHTML = accounts[0] || 'Not able to get accounts'
      } catch (error) {
        console.error(error)
        getAccountsResults.innerHTML = `Error: ${error}`
      }
    })
  }

  updateButtons()

  if (isConfluxPortalInstalled()) {

    initDisplayBalances()
    initCFXDirectDepositButtons()

    conflux.autoRefreshOnNetworkChange = false
    conflux.on('networkChanged', networkId => {
      networkDiv.innerHTML = networkId
    })
    conflux.on('chainIdChanged', chainId => {
      chainIdDiv.innerHTML = chainId
    })
    conflux.on('accountsChanged', newAccounts => {
      const connecting = Boolean(
        (!accounts || !accounts.length) && newAccounts && newAccounts.length
      )
      accounts = newAccounts
      accountsDiv.innerHTML = accounts
      if (connecting) {
        initializeAccountButtons()
      }
      updateButtons()
    })
  }
}
window.addEventListener('DOMContentLoaded', initialize)
