import { ethers } from 'hardhat';
import { Signer } from 'ethers';
import { expect } from 'chai';
import "@nomicfoundation/hardhat-ethers";

describe('Crowdfunding Contract', function () {
  let owner: Signer;
  let contributor1: Signer;
  let contributor2: Signer;
  let crowdfunding: any; // Change 'any' to the correct contract type

  before(async () => {
    [owner, contributor1, contributor2] = await ethers.getSigners();

    const Crowdfunding = await ethers.getContractFactory('crowdfunding'); // Make sure to replace 'crowdfunding' with the actual contract name
    crowdfunding = await Crowdfunding.deploy();

    await crowdfunding.deployed();
  });

  it('should create a new project', async () => {
    //const ownerAddress = await owner.getAddress();
    const projectName = 'MyProject';
    const projectDescription = 'A test project';
    const creatorName = 'TestCreator';
    const projectLink = 'https://github.com/alexnjoya/Donation-Dapp.git';
    //const cid = 'Qm1234567890'; 
    const fundingGoal = ethers.utils.parseEther('1'); // 1 Ether
    const duration = 7 * 24 * 60 * 60; // 7 days in seconds
    const category = 0; // Assuming Design and Tech
    const refundPolicy = 0; // Assuming Refundable
  
    // Create a new project
    await crowdfunding.connect(owner).createNewProject(
      projectName,
      projectDescription,
      creatorName,
      projectLink,
      //cid,
      fundingGoal,
      duration,
      category,
      refundPolicy
    );
  
    // Adding assertions to check if the project was created successfully
    const project = await crowdfunding.getProject(0); 
    expect(await project.creatorName).to.equal(creatorName);
    expect(await project.projectName).to.equal(projectName);
    expect(await project.projectDescription).to.equal(projectDescription);
    
  });

  

  it('should fund a project', async () => {
     // Assuming project 0 is created and available for funding
  const projectIndex = 0;
  const fundingAmount = ethers.utils.parseEther('0.5'); // 0.5 Ether

  // Contributor 1 funds the project
  await crowdfunding.connect(contributor1).fundProject(projectIndex, {
    value: fundingAmount,
  });

  // Adding assertions to check if the contribution was successful
  const fundedProjects = await crowdfunding.getUserFundings(await contributor1.getAddress());
  expect(fundedProjects.length).to.equal(1); // Contributor 1 funded one project
  // Add more assertions as needed to validate the funding
  });



  it('should allow the project creator to claim funds', async () => {
    // Assuming project 0 is created, funded, and it's time to claim funds
  const projectIndex = 0;

  // Simulate the project creator claiming funds
  await crowdfunding.connect(owner).claimFund(projectIndex);

  // Add assertions to check if the creator successfully claimed funds
  const project = await crowdfunding.getProject(projectIndex);
  expect(await project.claimedAmount).to.be.true; // Check if the claimedAmount flag is set to true
  // Add more assertions as needed to validate the claim funds process
  });



  it('should allow contributors to claim refunds', async () => {
    // Assuming project 0 is created, funded, and it didn't reach its goal
  const projectIndex = 0;

  // Simulate contributors (e.g., contributor1) claiming refunds
  const contributorIndex = await crowdfunding.getContributorIndex(projectIndex);

  if (contributorIndex !== -1) {
    await crowdfunding.connect(contributor1).claimRefund(projectIndex);

    // Add assertions to check if the contributor successfully claimed a refund
    const project = await crowdfunding.getProject(projectIndex);
    expect(await project.refundClaimed[contributorIndex]).to.be.true; // Check if the refundClaimed flag is set to true
    // Add more assertions as needed to validate the refund claim process
  } else {
    // Handle the case where the contributor did not contribute to this project (index not found)
    expect.fail('Contributor did not contribute to this project');
  }
  });

  

  // Example helper function for converting Ethereum wei to ethers
  function toEth(value: string) {
    return ethers.utils.formatEther(value);
  }
});
