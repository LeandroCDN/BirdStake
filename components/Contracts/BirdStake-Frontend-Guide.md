# BirdStake Frontend Integration Guide

## 📋 Overview

**BirdStake** es un contrato de staking que permite a los usuarios depositar tokens BIRD y recibir rewards. Implementa un sistema de **shared pool** donde el APY varía según la cantidad total stakeada.

### Key Features
- ✅ Stake BIRD tokens y recibe BIRD rewards
- ✅ Sistema de comisiones (2% por depósito)
- ✅ Shared pool (APY dinámico)
- ✅ Claim rewards sin unstake
- ✅ Permit2 para gasless approvals

---

## 🔥 Write Functions (User Actions)

### 1. `deposit()` - Stakear tokens

```solidity
function deposit(
    ISignatureTransfer.PermitTransferFrom memory permit,
    ISignatureTransfer.SignatureTransferDetails calldata transferDetails,
    bytes calldata signature
) external nonReentrant
```

**Descripción**: Permite al usuario stakear tokens BIRD.

**⚠️ Importante**: 
- Se cobra un **2% de comisión** automáticamente
- Solo se stakea el 98% del monto (monto neto después de fees)
- Requiere usar **Permit2** para el transfer

**Parámetros Frontend**:
```typescript
// Ejemplo para depositar 100 BIRD
const amount = ethers.parseEther("100"); // 100 BIRD
const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hora

const permit = {
  permitted: {
    token: BIRD_TOKEN_ADDRESS,
    amount: amount
  },
  nonce: await permit2.nonces(userAddress),
  deadline: deadline
};

const transferDetails = {
  to: BIRDSTAKE_CONTRACT_ADDRESS,
  requestedAmount: amount
};
```

**Eventos emitidos**:
- `Deposit(user, netAmount, fee)`
- `FeeCollected(user, feeAmount)`

---

### 2. `withdraw()` - Retirar tokens y/o claim rewards

```solidity
function withdraw(uint256 _amount) external nonReentrant
```

**Casos de uso**:

#### **Claim rewards solamente**:
```typescript
await birdStake.withdraw(0); // _amount = 0
```
- No retira tokens stakeados
- Solo reclama rewards pendientes
- Tokens stakeados permanecen generando rewards

#### **Unstake + claim rewards**:
```typescript
const stakedAmount = await birdStake.userInfo(userAddress).amount;
await birdStake.withdraw(stakedAmount); // Retira todo
```
- Retira tokens stakeados + rewards pendientes
- Puedes retirar parcialmente: `withdraw(ethers.parseEther("50"))`

**⚠️ Importante**: 
- Siempre reclama rewards pendientes automáticamente
- Sin comisiones en el withdraw

---

### 3. `emergencyWithdraw()` - Retiro de emergencia

```solidity
function emergencyWithdraw() external nonReentrant
```

**Descripción**: Retira todos los tokens stakeados sin reclamar rewards.
- Usar solo en emergencias
- Pierdes todos los rewards pendientes

---

## 📊 Read Functions (Get Data)

### 1. Información del Usuario

#### **Obtener tokens stakeados**:
```solidity
function userInfo(address user) external view returns (UserInfo memory)
```

```typescript
const userInfo = await birdStake.userInfo(userAddress);
const stakedAmount = userInfo.amount; // Wei format
const stakedAmountFormatted = ethers.formatEther(stakedAmount); // Human readable
```

#### **Obtener rewards pendientes**:
```solidity
function pendingReward(address _user) external view returns (uint256)
```

```typescript
const pendingRewards = await birdStake.pendingReward(userAddress);
const pendingRewardsFormatted = ethers.formatEther(pendingRewards);
```

---

### 2. Información del Pool

#### **Estadísticas generales**:
```typescript
// Total tokens stakeados en el pool
const totalStaked = await birdToken.balanceOf(BIRDSTAKE_CONTRACT_ADDRESS);

// Rewards por segundo
const rewardPerSecond = await birdStake.rewardPerSecond();

// Timestamps del pool
const startTime = await birdStake.startTimestamp();
const endTime = await birdStake.endTimestamp();

// Información de comisiones
const [houseEdge, houseWallet, totalFees] = await birdStake.getFeesInfo();
```

#### **Calcular comisión de depósito**:
```solidity
function calculateFee(uint256 _amount) external view returns (uint256)
```

```typescript
const depositAmount = ethers.parseEther("100");
const fee = await birdStake.calculateFee(depositAmount);
const netAmount = depositAmount - fee;

console.log(`Depositar: ${ethers.formatEther(depositAmount)} BIRD`);
console.log(`Comisión: ${ethers.formatEther(fee)} BIRD`);
console.log(`Neto stakeado: ${ethers.formatEther(netAmount)} BIRD`);
```

---

### 3. 📈 Calcular APR Actual

```typescript
async function calculateCurrentAPR() {
  // Obtener datos del contrato
  const rewardPerSecond = await birdStake.rewardPerSecond();
  const totalStaked = await birdToken.balanceOf(BIRDSTAKE_CONTRACT_ADDRESS);
  
  // Evitar división por cero
  if (totalStaked === 0n) return 0;
  
  // Calcular rewards anuales
  const rewardsPerYear = rewardPerSecond * BigInt(365 * 24 * 3600); // 1 año en segundos
  
  // Calcular APR = (rewards anuales / total staked) * 100
  const apr = (rewardsPerYear * 10000n) / totalStaked; // Multiplicar por 10000 para obtener basis points
  
  // Convertir a porcentaje
  return Number(apr) / 100; // Retorna APR como número decimal (ej: 25.5 = 25.5%)
}

// Uso
const currentAPR = await calculateCurrentAPR();
console.log(`APR actual: ${currentAPR}%`);
```

---

## 🎯 UI Examples

### **User Dashboard Data**:
```typescript
async function getUserDashboardData(userAddress: string) {
  const userInfo = await birdStake.userInfo(userAddress);
  const pendingRewards = await birdStake.pendingReward(userAddress);
  const currentAPR = await calculateCurrentAPR();
  
  return {
    stakedAmount: ethers.formatEther(userInfo.amount),
    pendingRewards: ethers.formatEther(pendingRewards),
    currentAPR: currentAPR,
    canClaim: pendingRewards > 0n
  };
}
```

### **Deposit Preview**:
```typescript
async function getDepositPreview(amount: string) {
  const depositAmount = ethers.parseEther(amount);
  const fee = await birdStake.calculateFee(depositAmount);
  const netAmount = depositAmount - fee;
  
  return {
    depositAmount: ethers.formatEther(depositAmount),
    fee: ethers.formatEther(fee),
    netAmount: ethers.formatEther(netAmount),
    feePercentage: "2%" // Siempre 2%
  };
}
```

---

## 🔗 Contract Addresses

```typescript
// Mainnet addresses (actualizar con addresses reales)
const BIRDSTAKE_CONTRACT = "0x..."; // Después del deploy
const BIRD_TOKEN = "0x36291184a593fe7E0A6af87e126A511E4a1fc284";
const PERMIT2 = "0x000000000022D473030F116dDEE9F6B43aC78BA3";
```

---

## ⚡ Quick Integration Checklist

- [ ] Implementar `calculateCurrentAPR()` para mostrar APY dinámico
- [ ] Usar `pendingReward()` para mostrar rewards en tiempo real
- [ ] Implementar preview de comisiones con `calculateFee()`
- [ ] Botón "Claim Rewards" → `withdraw(0)`
- [ ] Botón "Unstake" → `withdraw(amount)`
- [ ] Integrar Permit2 para mejor UX (no approvals)
- [ ] Mostrar total stakeado del pool para transparencia 