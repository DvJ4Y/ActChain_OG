/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { MaintenanceContract } = require('..');
const winston = require('winston');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext {

    constructor() {
        this.stub = sinon.createStubInstance(ChaincodeStub);
        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.logging = {
            getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
            setLevel: sinon.stub(),
        };
    }

}

describe('MaintenanceContract', () => {

    let contract;
    let ctx;

    beforeEach(() => {
        contract = new MaintenanceContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"maintenance 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"maintenance 1002 value"}'));
    });

    describe('#maintenanceExists', () => {

        it('should return true for a maintenance', async () => {
            await contract.maintenanceExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a maintenance that does not exist', async () => {
            await contract.maintenanceExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createMaintenance', () => {

        it('should create a maintenance', async () => {
            await contract.createMaintenance(ctx, '1003', 'maintenance 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"maintenance 1003 value"}'));
        });

        it('should throw an error for a maintenance that already exists', async () => {
            await contract.createMaintenance(ctx, '1001', 'myvalue').should.be.rejectedWith(/The maintenance 1001 already exists/);
        });

    });

    describe('#readMaintenance', () => {

        it('should return a maintenance', async () => {
            await contract.readMaintenance(ctx, '1001').should.eventually.deep.equal({ value: 'maintenance 1001 value' });
        });

        it('should throw an error for a maintenance that does not exist', async () => {
            await contract.readMaintenance(ctx, '1003').should.be.rejectedWith(/The maintenance 1003 does not exist/);
        });

    });

    describe('#updateMaintenance', () => {

        it('should update a maintenance', async () => {
            await contract.updateMaintenance(ctx, '1001', 'maintenance 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"maintenance 1001 new value"}'));
        });

        it('should throw an error for a maintenance that does not exist', async () => {
            await contract.updateMaintenance(ctx, '1003', 'maintenance 1003 new value').should.be.rejectedWith(/The maintenance 1003 does not exist/);
        });

    });

    describe('#deleteMaintenance', () => {

        it('should delete a maintenance', async () => {
            await contract.deleteMaintenance(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a maintenance that does not exist', async () => {
            await contract.deleteMaintenance(ctx, '1003').should.be.rejectedWith(/The maintenance 1003 does not exist/);
        });

    });

});