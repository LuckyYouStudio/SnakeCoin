const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SnakeCoin", function () {
    let SnakeCoin;
    let snakeCoin;
    let owner;
    let addr1;
    let addr2;
    let addrs;

    beforeEach(async function () {
        SnakeCoin = await ethers.getContractFactory("SnakeCoin");
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
        snakeCoin = await SnakeCoin.deploy();
    });

    describe("部署", function () {
        it("应该正确设置名称和符号", async function () {
            expect(await snakeCoin.name()).to.equal("SnakeCoin");
            expect(await snakeCoin.symbol()).to.equal("SNAKE");
        });

        it("应该设置正确的最大供应量", async function () {
            expect(await snakeCoin.MAX_SUPPLY()).to.equal(10_000_000);
        });

        it("应该设置正确的所有者", async function () {
            expect(await snakeCoin.owner()).to.equal(owner.address);
        });
    });

    describe("铸造", function () {
        it("所有者应该能够铸造NFT", async function () {
            await snakeCoin.mint(addr1.address, 1);
            expect(await snakeCoin.ownerOf(0)).to.equal(addr1.address);
            expect(await snakeCoin.totalSupply()).to.equal(1);
        });

        it("所有者应该能够批量铸造NFT", async function () {
            await snakeCoin.mint(addr1.address, 5);
            expect(await snakeCoin.totalSupply()).to.equal(5);
            expect(await snakeCoin.ownerOf(0)).to.equal(addr1.address);
            expect(await snakeCoin.ownerOf(4)).to.equal(addr1.address);
        });

        it("非所有者不能铸造NFT", async function () {
            await expect(
                snakeCoin.connect(addr1).mint(addr2.address, 1)
            ).to.be.revertedWithCustomError(snakeCoin, "OwnableUnauthorizedAccount");
        });

        it("不能超过最大供应量", async function () {
            await expect(
                snakeCoin.mint(addr1.address, 10_000_001)
            ).to.be.revertedWith("超过最大供应量");
        });
    });

    describe("批量铸造", function () {
        it("所有者应该能够批量铸造给多个地址", async function () {
            const recipients = [addr1.address, addr2.address, addrs[0].address];
            await snakeCoin.batchMint(recipients);
            
            expect(await snakeCoin.totalSupply()).to.equal(3);
            expect(await snakeCoin.ownerOf(0)).to.equal(addr1.address);
            expect(await snakeCoin.ownerOf(1)).to.equal(addr2.address);
            expect(await snakeCoin.ownerOf(2)).to.equal(addrs[0].address);
        });
    });

    describe("SVG生成", function () {
        beforeEach(async function () {
            await snakeCoin.mint(addr1.address, 1);
        });

        it("应该能够生成SVG", async function () {
            const svg = await snakeCoin.generateSnakeSVG(0);
            expect(svg).to.include("<svg");
            expect(svg).to.include("xmlns=\"http://www.w3.org/2000/svg\"");
        });

        it("SVG应该包含正确的tokenId", async function () {
            const svg = await snakeCoin.generateSnakeSVG(0);
            expect(svg).to.include("#0000000");
        });

        it("SVG应该包含渐变定义", async function () {
            const svg = await snakeCoin.generateSnakeSVG(0);
            expect(svg).to.include("<linearGradient");
            expect(svg).to.include("grad0");
        });
    });

    describe("tokenURI", function () {
        beforeEach(async function () {
            await snakeCoin.mint(addr1.address, 1);
        });

        it("应该返回Base64编码的JSON", async function () {
            const tokenURI = await snakeCoin.tokenURI(0);
            expect(tokenURI).to.include("data:application/json;base64,");
        });

        it("应该包含正确的元数据", async function () {
            const tokenURI = await snakeCoin.tokenURI(0);
            const base64Data = tokenURI.replace("data:application/json;base64,", "");
            const jsonString = Buffer.from(base64Data, 'base64').toString();
            const metadata = JSON.parse(jsonString);
            
            expect(metadata.name).to.equal("SnakeCoin #0");
            expect(metadata.description).to.equal("蛇币NFT - 链上生成的独特蛇形图案");
            expect(metadata.image).to.include("data:image/svg+xml;base64,");
            expect(metadata.attributes).to.have.lengthOf(3);
        });

        it("应该包含正确的属性", async function () {
            const tokenURI = await snakeCoin.tokenURI(0);
            const base64Data = tokenURI.replace("data:application/json;base64,", "");
            const jsonString = Buffer.from(base64Data, 'base64').toString();
            const metadata = JSON.parse(jsonString);
            
            const snakeCodeAttr = metadata.attributes.find(attr => attr.trait_type === "蛇码");
            const colorThemeAttr = metadata.attributes.find(attr => attr.trait_type === "颜色主题");
            const patternTypeAttr = metadata.attributes.find(attr => attr.trait_type === "图案类型");
            
            expect(snakeCodeAttr.value).to.equal("0");
            expect(colorThemeAttr.value).to.equal("#FF6B6B");
            expect(patternTypeAttr.value).to.equal("M10,10 Q20,5 30,10 T50,10");
        });
    });

    describe("颜色和路径管理", function () {
        it("所有者应该能够更新颜色", async function () {
            const newColor = "#FF0000";
            await snakeCoin.updateColor(0, newColor);
            expect(await snakeCoin.colors(0)).to.equal(newColor);
        });

        it("所有者应该能够更新蛇形路径", async function () {
            const newPath = "M10,10 L50,50";
            await snakeCoin.updateSnakePath(0, newPath);
            expect(await snakeCoin.snakePaths(0)).to.equal(newPath);
        });

        it("非所有者不能更新颜色", async function () {
            await expect(
                snakeCoin.connect(addr1).updateColor(0, "#FF0000")
            ).to.be.revertedWithCustomError(snakeCoin, "OwnableUnauthorizedAccount");
        });

        it("非所有者不能更新路径", async function () {
            await expect(
                snakeCoin.connect(addr1).updateSnakePath(0, "M10,10 L50,50")
            ).to.be.revertedWithCustomError(snakeCoin, "OwnableUnauthorizedAccount");
        });
    });

    describe("查询功能", function () {
        it("应该正确返回剩余供应量", async function () {
            expect(await snakeCoin.remainingSupply()).to.equal(10_000_000);
            await snakeCoin.mint(addr1.address, 100);
            expect(await snakeCoin.remainingSupply()).to.equal(9_999_900);
        });

        it("应该正确检查tokenId是否存在", async function () {
            expect(await snakeCoin.exists(0)).to.be.false;
            await snakeCoin.mint(addr1.address, 1);
            expect(await snakeCoin.exists(0)).to.be.true;
        });
    });

    describe("边界情况", function () {
        it("应该能够铸造到最大供应量", async function () {
            await snakeCoin.mint(addr1.address, 10_000_000);
            expect(await snakeCoin.totalSupply()).to.equal(10_000_000);
            expect(await snakeCoin.remainingSupply()).to.equal(0);
        });

        it("无效的tokenId应该被拒绝", async function () {
            await expect(
                snakeCoin.generateSnakeSVG(10_000_000)
            ).to.be.revertedWith("无效的tokenId");
        });

        it("查询不存在的token应该被拒绝", async function () {
            await expect(
                snakeCoin.tokenURI(0)
            ).to.be.revertedWith("ERC721Metadata: URI query for nonexistent token");
        });
    });
});
