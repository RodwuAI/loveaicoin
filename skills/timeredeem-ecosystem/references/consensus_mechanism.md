# TimeRedeem Consensus Node Technical Framework

## Overview

The TimeRedeem consensus mechanism combines delegated proof-of-stake (DPoS) principles with a unique time-value attribution system, creating a hybrid model that rewards both network security and ecosystem growth.

## Core Architecture

### Network Structure

```
Super Nodes (5 max)
    ↓
Consensus Nodes (Regional)
    ↓
Referral Nodes (Expansion)
    ↓
Time Openers (Early Adopters)
```

### Node Types

#### 1. Super Nodes
- **Count**: Maximum 5 globally
- **Role**: Network governance, major decisions
- **Requirements**: 
  - 100+ downstream nodes
  - $1M+ monthly transaction volume
  - 99.99% uptime SLA
  - Regional presence
- **Rewards**: 10% of network fees + governance rights

#### 2. Consensus Nodes
- **Role**: Transaction validation, block production
- **Requirements**:
  - Minimum stake: 10,000 TRM tokens
  - Hardware: 8 CPU, 32GB RAM, 500GB SSD
  - Network: 100Mbps dedicated bandwidth
  - Uptime: 99.9% SLA
- **Rewards**: Base reward + transaction fees + referral bonuses

#### 3. Referral Nodes
- **Role**: Network expansion, partner acquisition
- **Requirements**:
  - Active community presence
  - Monthly referral targets
- **Rewards**: Multi-level referral commissions

## Consensus Algorithm

### Modified DPoS + Time-Value Proof

1. **Block Production**
   - 21 active validators rotate every 3 seconds
   - Selection weighted by: Stake × Uptime Score × Time Value Contribution

2. **Time Value Contribution (TVC)**
   - Calculated from:
     - Time assets facilitated (40%)
     - AI twin interactions (30%)
     - Metaverse engagement (20%)
     - Referral network activity (10%)

3. **Uptime Score**
   - Measured in 1-hour windows
   - Penalty: -10% per hour of downtime
   - Bonus: +5% for consecutive 30-day 100% uptime

### Reward Distribution Formula

```
Node Reward = Base Reward 
              + (Transaction Fees × Node Stake / Total Stake)
              + (TVC Multiplier × Activity Score)
              + Referral Bonuses
```

## Multi-Level Referral System

### Structure

```
Level 1 (Direct): 20% commission
    ↓
Level 2: 10% commission
    ↓
Level 3: 5% commission
```

### Calculation Example

If Node A refers Node B, who refers Node C, who refers Node D:

- Node A earns 20% of Node B's rewards
- Node A earns 10% of Node C's rewards  
- Node A earns 5% of Node D's rewards
- Node B earns 20% of Node C's rewards
- Node B earns 10% of Node D's rewards
- Node C earns 20% of Node D's rewards

### Network Depth Limits
- Maximum 10 levels for commission calculation
- Beyond Level 3: 2.5% commission (up to Level 10)
- Anti-cycling: 48-hour lock between referrals

## Security Mechanisms

### Slashing Conditions

Nodes face penalties for:
1. **Double Signing**: 100% stake slashing
2. **Downtime** (< 95% monthly): 10% stake penalty
3. **Malicious Activity**: 50-100% stake slashing
4. **Failure to Upgrade**: Warning → 5% penalty → Removal

### Recovery Mechanism
- Slashed nodes can recover 50% of penalty after 90 days of good behavior
- Requires community vote for restoration

## Technical Specifications

### Node Software Requirements
- **OS**: Ubuntu 20.04 LTS or later
- **Blockchain Client**: TimeRedeem Node v2.0+
- **Docker**: Required for containerized deployment
- **Monitoring**: Prometheus + Grafana stack

### API Endpoints
- `/consensus/validate`: Transaction validation
- `/consensus/propose`: Block proposal
- `/network/status`: Node status reporting
- `/referral/track`: Referral relationship tracking

### Smart Contracts
1. **NodeRegistry.sol**: Node registration and staking
2. **RewardDistributor.sol**: Automated reward distribution
3. **ReferralTracker.sol**: Multi-level referral tracking
4. **Governance.sol**: Voting and proposal management

## Economic Model

### Token: TRM (TimeRedeem Token)
- **Total Supply**: 1,000,000,000 TRM
- **Initial Distribution**:
  - Team: 20% (4-year vesting)
  - Investors: 15% (2-year vesting)
  - Ecosystem: 30% (Partner rewards, 10-year emission)
  - Community: 25% (Mining, 20-year emission)
  - Reserve: 10%

### Inflation Schedule
- Year 1-2: 10% annual inflation
- Year 3-5: 7% annual inflation
- Year 6+: 5% annual inflation (adjustable by governance)

### Fee Structure
- Time Asset Trading: 2.5% per transaction
- AI Twin Usage: 1% per interaction
- Metaverse Land: 5% of land sale value
- Withdrawal: 0.1% + network gas

## Roadmap

### Phase 1: Foundation (Q4 2024 - Q1 2025)
- Launch testnet with 50 consensus nodes
- Deploy core smart contracts
- Implement basic referral system

### Phase 2: Growth (Q2 2025 - Q3 2025)
- Mainnet launch
- Expand to 200+ consensus nodes
- Introduce super node elections

### Phase 3: Scale (Q4 2025+)
- Cross-chain bridge integration
- Decentralized governance full activation
- Global node distribution

## Monitoring & Analytics

### Key Metrics
- Network hash rate / validation throughput
- Node uptime distribution
- Referral network depth and width
- TVC scores by node
- Token velocity and staking ratio

### Dashboards
- Node operators: Real-time performance metrics
- Partners: Referral network visualization
- Governance: Proposal tracking and voting
- Ecosystem: Overall health indicators
