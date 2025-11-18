# Project Description

**Deployed Frontend URL:** https://program-x-ariextz.vercel.app/

**Solana Program ID:** Eq4oinoryPeSe3yL664Ux8q7FgdGRXTweW9uqVUTvn4n

## Project Overview

### Description
**Pay2Msg** is a decentralized messaging dApp built on Solana where users can receive paid messages.  
Each user registers a **profile with a customizable price**, and anyone can send them an on-chain message by **paying at least that price**.

When a user receives a message:

- The funds paid for the message are locked inside the message account.
- The message remains unread until the user explicitly **reads & claims** it.
- Upon reading, the message is deleted and the payment is transferred to the recipient’s wallet.

This design models systems like **Twitch donations**, **paid inboxes**, **creator tips**, or **priority messaging**, but entirely on-chain through PDAs and Anchor.

The goal of the project is to demonstrate:
- PDA account derivation  
- Stateful on-chain logic  
- Funds-handling with CPIs  
- Account validation  
- Frontend integration with Anchor IDL  

---

### Key Features
- **User Registration**
  - Users create a profile with a price (in lamports) required to message them.

- **Update Message Price**
  - Users can adjust their message cost at any time.

- **Send Paid Messages**
  - Anyone can send a message to a registered user by paying their rate.
  - The payment is locked inside the message PDA.

- **Inbox System**
  - Recipients can load all messages addressed to them.

- **Read & Claim**
  - Reading a message automatically deletes it and transfers the locked funds.

- **Full Frontend Integration**
  - Wallet connect  
  - Register / update profile  
  - Send messages  
  - Inbox viewer + claim messages  

---

  
### How to Use the dApp
1. **Connect Wallet**
   - Open the frontend and connect your Solflare/Phantom wallet on Devnet.

2. **Register Your Profile**
   - Enter the price (in SOL) you want people to pay to message you.
   - Click **"Register profile"**.

3. **Update Price (Optional)**
   - Modify your rate anytime by clicking **"Update price"**.

4. **Send a Paid Message**
   - Enter:
     - Recipient public key  
     - Amount (SOL)  
     - Message content  
   - Click **"Send message"**.

5. **Load Your Inbox**
   - Click *Load inbox* to fetch messages sent to you.

6. **Read & Claim**
   - Click **"Read & claim"** to:
     - Transfer the locked lamports to your wallet  
     - Mark the message as read (account gets closed)

---


## Program Architecture
The Pay2Msg program is composed of two primary account types:

- **UserProfile** — Stores pricing and aggregated message stats  
- **Message** — Represents a single paid message sent to a user

The program implements:
- PDA-based deterministic account creation  
- Funds transfers via CPI to the System Program  
- Message lifecycle (create → read/claim → close)

---

### PDA Usage
PDAs ensure secure, deterministic account generation.

**PDAs Used:**
#### 1. **User Profile PDA**
- **Seeds:** `["profile", owner_pubkey]`  
- **Purpose:** uniquely identify each user’s profile and prevent duplicates.

#### 2. **Message PDA**
- **Seeds:**  
```rust
[
    "message",
    recipient_pubkey,
    sender_pubkey,
    salt (u64 LE)
]
```

- **Purpose:**  
- Create a unique message account for each message  
- Lock funds until the message is claimed  
- Prevent collisions

Using sender + recipient + salt makes each message unique even if the same sender sends multiple messages to the same recipient.

---
### Program Instructions
### **1. register_user(price_lamports: u64)**
Creates a new user profile PDA with:
- owner pubkey  
- price  
- bump  
- initial stats  

Fails if profile already exists.

---

### **2. update_price(new_price: u64)**
Updates a user’s message price.  
Only callable by the profile owner.

---

### **3. send_message(salt: u64, amount: u64, content: String)**
Creates a message PDA, transfers lamports from sender → message PDA, and stores:
- sender pubkey  
- recipient pubkey  
- amount  
- content  
- timestamp  

Validates:
- message price is sufficient  
- content size ≤ MAX_CONTENT_LEN  

---

### **4. read_and_claim()**
Allows the recipient to:
- read the message  
- claim and transfer the locked lamports  
- close (delete) the message account  

---

### Account Structure
### **UserProfile**
```rust
#[account]
pub struct UserProfile {
  pub owner: Pubkey,       // owner of the profile
  pub price_lamports: u64, // required price to message this user
  pub inbox_count: u64,    // total messages received
  pub received_total: u64, // total lamports earned
  pub created_at: i64,     // timestamp
  pub bump: u8,            // PDA bump
}
```

### **Message**
```rust
#[account]
pub struct Message {
    pub sender: Pubkey,
    pub recipient: Pubkey,
    pub amount_lamports: u64,
    pub content: String,
    pub timestamp: i64,
    pub bump: u8,
}
```

## Testing

### Test Coverage
The test suite covers all four program instructions with both successful ("happy path") and intentional failure ("unhappy path") scenarios.  
All tests run locally using `anchor test` and rely on PDAs, lamport transfers, and account constraints to verify correct program behavior.

---

**Happy Path Tests:**
- **Register profile**  
  Creates a new `UserProfile` PDA and verifies:
  - correct PDA derivation
  - correct owner
  - price stored properly
  - bump matches PDA derivation
  - timestamps and counters initialized

- **Update price**  
  Updates the existing profile's `price_lamports` field and ensures the new value is written correctly.

- **Send message**  
  Creates a `Message` PDA and ensures:
  - lamports are transferred into the message account
  - message data (sender, recipient, content, amount) is stored correctly
  - inbox counters increment

- **Read & claim**  
  Allows the recipient to:
  - read a previously sent message
  - receive the locked lamports
  - close the message PDA  
  Test verifies lamport balances before/after and that the message account no longer exists.

---

**Unhappy Path Tests:**
- **Register profile twice**  
  Attempting to initialize a second profile for the same user fails due to the PDA already existing.

- **Send message below required price**  
  Sending a message with insufficient lamports triggers a controlled error (`InsufficientFunds`).

- **Send message with wrong seeds / mismatched PDA**  
  Ensures PDA derivation constraints prevent tampering or spoofed message accounts.

- **Read message as non-recipient**  
  Fails because the account constraint enforces that only the intended recipient can read & claim.

- **Update price as non-owner**  
  Fails authority check since the signer must match the profile's owner.

Together, these tests confirm the correctness and security of all instruction flows.

---

### Running Tests
```bash
anchor test
```

The test runner will:

- Build the Anchor program  
- Launch a local Solana test validator  
- Execute all test suites (happy + unhappy paths)  
- Verify PDA derivations and account constraints  
- Perform lamport transfers and simulate real interactions  
- Output detailed logs for debugging and validation  

---


### Additional Notes for Evaluators
- All program logic is validated through real PDA derivations, lamport transfers, and strict account constraints.
- Every instruction includes both successful and failing scenarios to ensure robustness and correctness.
- The security model is enforced through:
  - PDA seed checks  
  - Authority restrictions  
  - Data validation  
  - Controlled error handling  