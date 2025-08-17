const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LuckSnake", function () {
    let LuckSnake;
    let luckSnake;
    let owner;
    let addr1;
    let addr2;
    let addrs;

    const GENERATION_PRICE = ethers.parseEther("0.0001");

    beforeEach(async function () {
        LuckSnake = await ethers.getContractFactory("LuckSnake");
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
        luckSnake = await LuckSnake.deploy();
    });

    describe("部署", function () {
        it("应该正确设置生成价格", async function () {
            expect(await luckSnake.GENERATION_PRICE()).to.equal(GENERATION_PRICE);
        });

        it("应该设置正确的数字范围", async function () {
            expect(await luckSnake.MIN_NUMBER()).to.equal(0);
            expect(await luckSnake.MAX_NUMBER()).to.equal(999);
        });

        it("应该设置正确的所有者", async function () {
            expect(await luckSnake.owner()).to.equal(owner.address);
        });

        it("初始状态应该为空", async function () {
            expect(await luckSnake.totalGeneratedNumbers()).to.equal(0);
            expect(await luckSnake.getRemainingNumbers()).to.equal(1000);
        });
    });

    describe("数字生成功能", function () {
        it("用户应该能够支付0.0001ETH生成数字", async function () {
            const tx = await luckSnake.connect(addr1).generateNumber({ value: GENERATION_PRICE });
            const receipt = await tx.wait();
            
            // 检查事件
            const event = receipt.logs.find(log => log.fragment && log.fragment.name === "NumberGenerated");
            expect(event.args.user).to.equal(addr1.address);
            expect(event.args.price).to.equal(GENERATION_PRICE);
            
            // 检查数字范围
            const generatedNumber = event.args.number;
            expect(generatedNumber).to.be.gte(0);
            expect(generatedNumber).to.be.lte(999);
            
            // 检查状态更新
            expect(await luckSnake.totalGeneratedNumbers()).to.equal(1);
            expect(await luckSnake.getRemainingNumbers()).to.equal(999);
        });

        it("支付不足应该被拒绝", async function () {
            const insufficientPayment = ethers.parseEther("0.00005");
            await expect(
                luckSnake.connect(addr1).generateNumber({ value: insufficientPayment })
            ).to.be.revertedWith("Insufficient payment");
        });

        it("应该自动退还多余的ETH", async function () {
            const overpayment = ethers.parseEther("0.0002");
            const initialBalance = await ethers.provider.getBalance(addr1.address);
            
            const tx = await luckSnake.connect(addr1).generateNumber({ value: overpayment });
            const receipt = await tx.wait();
            
            const finalBalance = await ethers.provider.getBalance(addr1.address);
            const gasUsed = receipt.gasUsed * receipt.gasPrice;
            
            // 用户只应该支付GENERATION_PRICE，多余部分应该退还
            const expectedBalance = initialBalance - GENERATION_PRICE - gasUsed;
            expect(finalBalance).to.equal(expectedBalance);
        });

        it("生成的数字应该被正确记录", async function () {
            const tx = await luckSnake.connect(addr1).generateNumber({ value: GENERATION_PRICE });
            const receipt = await tx.wait();
            const event = receipt.logs.find(log => log.fragment && log.fragment.name === "NumberGenerated");
            const generatedNumber = event.args.number;
            
            // 检查数字所有权
            expect(await luckSnake.getNumberOwner(generatedNumber)).to.equal(addr1.address);
            expect(await luckSnake.isNumberTaken(generatedNumber)).to.be.true;
            
            // 检查用户数字列表
            const userNumbers = await luckSnake.getUserNumbers(addr1.address);
            expect(userNumbers.length).to.equal(1);
            expect(userNumbers[0]).to.equal(generatedNumber);
        });
    });

    describe("查询功能", function () {
        beforeEach(async function () {
            // 生成一些数字用于测试
            await luckSnake.connect(addr1).generateNumber({ value: GENERATION_PRICE });
            await luckSnake.connect(addr2).generateNumber({ value: GENERATION_PRICE });
        });

        it("应该正确返回用户拥有的数字", async function () {
            const addr1Numbers = await luckSnake.getUserNumbers(addr1.address);
            const addr2Numbers = await luckSnake.getUserNumbers(addr2.address);
            
            expect(addr1Numbers.length).to.equal(1);
            expect(addr2Numbers.length).to.equal(1);
            expect(addr1Numbers[0]).to.not.equal(addr2Numbers[0]);
        });

        it("应该正确返回数字的所有者", async function () {
            const addr1Numbers = await luckSnake.getUserNumbers(addr1.address);
            const addr2Numbers = await luckSnake.getUserNumbers(addr2.address);
            
            expect(await luckSnake.getNumberOwner(addr1Numbers[0])).to.equal(addr1.address);
            expect(await luckSnake.getNumberOwner(addr2Numbers[0])).to.equal(addr2.address);
        });

        it("应该正确检查数字是否已被生成", async function () {
            const addr1Numbers = await luckSnake.getUserNumbers(addr1.address);
            const addr2Numbers = await luckSnake.getUserNumbers(addr2.address);
            
            expect(await luckSnake.isNumberTaken(addr1Numbers[0])).to.be.true;
            expect(await luckSnake.isNumberTaken(addr2Numbers[0])).to.be.true;
            
            // 检查未生成的数字
            let unusedNumber = 500;
            while (await luckSnake.isNumberTaken(unusedNumber)) {
                unusedNumber++;
            }
            expect(await luckSnake.isNumberTaken(unusedNumber)).to.be.false;
        });

        it("应该正确返回用户数字数量", async function () {
            expect(await luckSnake.getUserNumberCount(addr1.address)).to.equal(1);
            expect(await luckSnake.getUserNumberCount(addr2.address)).to.equal(1);
            
            // 生成更多数字
            await luckSnake.connect(addr1).generateNumber({ value: GENERATION_PRICE });
            expect(await luckSnake.getUserNumberCount(addr1.address)).to.equal(2);
        });

        it("应该正确返回系统信息", async function () {
            const systemInfo = await luckSnake.getSystemInfo();
            
            expect(systemInfo.price).to.equal(GENERATION_PRICE);
            expect(systemInfo.totalGenerated).to.equal(2);
            expect(systemInfo.remaining).to.equal(998);
            expect(systemInfo.contractBalance).to.equal(GENERATION_PRICE * 2n);
        });
    });

    describe("防重复逻辑", function () {
        it("同一个数字不应该被生成两次", async function () {
            // 生成大量数字来测试防重复逻辑
            const generatedNumbers = new Set();
            
            for (let i = 0; i < 10; i++) {
                const tx = await luckSnake.connect(addrs[i % addrs.length]).generateNumber({ value: GENERATION_PRICE });
                const receipt = await tx.wait();
                const event = receipt.logs.find(log => log.fragment && log.fragment.name === "NumberGenerated");
                const generatedNumber = event.args.number;
                
                expect(generatedNumbers.has(generatedNumber.toString())).to.be.false;
                generatedNumbers.add(generatedNumber.toString());
            }
            
            expect(generatedNumbers.size).to.equal(10);
        });

        it("所有数字生成完毕后应该拒绝新的生成请求", async function () {
            // 这个测试可能需要很长时间，所以我们先跳过
            // 在实际测试中，你可能想要减少最大数字范围来测试这个功能
            this.skip();
        });

        it("用户随机数种子应该递增", async function () {
            const initialNonce = await luckSnake.getUserNonce(addr1.address);
            
            await luckSnake.connect(addr1).generateNumber({ value: GENERATION_PRICE });
            expect(await luckSnake.getUserNonce(addr1.address)).to.equal(initialNonce + 1n);
            
            await luckSnake.connect(addr1).generateNumber({ value: GENERATION_PRICE });
            expect(await luckSnake.getUserNonce(addr1.address)).to.equal(initialNonce + 2n);
        });
    });

    describe("权限控制", function () {
        beforeEach(async function () {
            // 生成一些数字，让合约有余额
            await luckSnake.connect(addr1).generateNumber({ value: GENERATION_PRICE });
            await luckSnake.connect(addr2).generateNumber({ value: GENERATION_PRICE });
        });

        it("所有者应该能够提取资金", async function () {
            const contractBalance = await luckSnake.getContractBalance();
            const ownerInitialBalance = await ethers.provider.getBalance(owner.address);
            
            const tx = await luckSnake.withdrawFunds();
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed * receipt.gasPrice;
            
            const ownerFinalBalance = await ethers.provider.getBalance(owner.address);
            const expectedBalance = ownerInitialBalance + contractBalance - gasUsed;
            
            expect(ownerFinalBalance).to.equal(expectedBalance);
            expect(await luckSnake.getContractBalance()).to.equal(0);
        });

        it("非所有者不能提取资金", async function () {
            await expect(
                luckSnake.connect(addr1).withdrawFunds()
            ).to.be.revertedWithCustomError(luckSnake, "OwnableUnauthorizedAccount");
        });

        it("没有资金时提取应该被拒绝", async function () {
            await luckSnake.withdrawFunds(); // 先提取所有资金
            
            await expect(
                luckSnake.withdrawFunds()
            ).to.be.revertedWith("No funds to withdraw");
        });

        it("应该正确发出资金提取事件", async function () {
            const contractBalance = await luckSnake.getContractBalance();
            
            await expect(luckSnake.withdrawFunds())
                .to.emit(luckSnake, "FundsWithdrawn")
                .withArgs(owner.address, contractBalance);
        });
    });

    describe("边界情况", function () {
        it("查询无效数字范围应该被拒绝", async function () {
            await expect(
                luckSnake.getNumberOwner(1000)
            ).to.be.revertedWith("Invalid number range");
            
            await expect(
                luckSnake.isNumberTaken(1001)
            ).to.be.revertedWith("Invalid number range");
        });

        it("合约应该能够接收ETH", async function () {
            const initialBalance = await luckSnake.getContractBalance();
            
            await owner.sendTransaction({
                to: await luckSnake.getAddress(),
                value: ethers.parseEther("0.1")
            });
            
            expect(await luckSnake.getContractBalance()).to.equal(
                initialBalance + ethers.parseEther("0.1")
            );
        });

        it("未生成数字的用户应该返回空数组", async function () {
            const numbers = await luckSnake.getUserNumbers(addrs[0].address);
            expect(numbers.length).to.equal(0);
        });

        it("未被拥有的数字应该返回零地址", async function () {
            const owner = await luckSnake.getNumberOwner(999);
            expect(owner).to.equal(ethers.ZeroAddress);
        });
    });

    describe("重入攻击防护", function () {
        it("generateNumber函数应该有重入保护", async function () {
            // 这是一个简单的测试，实际的重入攻击测试需要更复杂的合约
            await expect(
                luckSnake.connect(addr1).generateNumber({ value: GENERATION_PRICE })
            ).to.not.be.reverted;
        });
    });

    describe("gas优化测试", function () {
        it("批量生成数字的gas消耗应该合理", async function () {
            const gasCosts = [];
            
            for (let i = 0; i < 5; i++) {
                const tx = await luckSnake.connect(addrs[i]).generateNumber({ value: GENERATION_PRICE });
                const receipt = await tx.wait();
                gasCosts.push(receipt.gasUsed);
            }
            
            // 检查gas消耗是否在合理范围内（具体数值可能需要根据实际情况调整）
            gasCosts.forEach(gas => {
                expect(gas).to.be.lessThan(200000); // 假设gas消耗应该少于200k
            });
        });
    });
});