import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { LacToken } from "../target/types/lac_token";
import { LacVesting } from "../target/types/lac_vesting";
import { LacMining } from "../target/types/lac_mining";
import { LacStaking } from "../target/types/lac_staking";
import { assert } from "chai";

describe("lac-contracts", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const tokenProgram = anchor.workspace.LacToken as Program<LacToken>;
  const vestingProgram = anchor.workspace.LacVesting as Program<LacVesting>;
  const miningProgram = anchor.workspace.LacMining as Program<LacMining>;
  const stakingProgram = anchor.workspace.LacStaking as Program<LacStaking>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await tokenProgram.methods.initialize(0, 0, 0, 0, 0).rpc(); // Arguments are dummy bumps if not used
    console.log("Your transaction signature", tx);
  });
});
