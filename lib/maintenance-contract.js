/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const shim = require('fabric-shim');
// const util = require('util');


// predefined maintenance states
const pipe_maintenanceStatus = {

    Create: { code: 1, text: 'Create Maintenance' },
    Accepted: { code: 2, text: 'Maintenance Accepted' },
    Cancelled: { code: 3, text: 'Maintenance Cancelled' },
    maintenanceOrdered: { code: 4, text: 'Maintenance order Submitted to equipment' },
    StaffRequest: { code: 10, text: 'Staff Requested' },
    Provided: { code: 11, text: 'Staff Provided' },
    EquipmentRequested: { code: 5, text: 'Equipment Requested' },
    EquipmentProvided: { code: 14, text: 'Equipment Provided' },
    InspectMaintenance: { code: 12, text: 'Inspect Maintenance' },
    InspectionStatus: { code: 13, text: 'Inspection Status' }
};

// Global Finance contract
let ActChain_OG = class {
    async Init(stub) {
        console.log(
            '=========== Init: Instantiated / Upgraded ngo chaincode ==========='
        );
        return shim.success();
    }

    async Invoke(stub) {
        console.log('============= START : Invoke ===========');
        let ret = stub.getFunctionAndParameters();
        console.log('##### Invoke args: ' + JSON.stringify(ret));

        let method = this[ret.fcn];
        if (!method) {
            console.error(
                '##### Invoke - error: no chaincode function with name: ' +
                ret.fcn +
                ' found'
            );
            throw new Error(
                'No chaincode function with name: ' + ret.fcn + ' found'
            );
        }
        try {
            let response = await method(stub, ret.params);
            console.log('##### Invoke response payload: ' + response);
            return shim.success(response);
        } catch (err) {
            console.log('##### Invoke - error: ' + err);
            return shim.error(err);
        }
    }

    async initLedger(stub, args) {
        console.log('============= START : Initialize Ledger ===========');
        console.log('============= END : Initialize Ledger ===========');
    }







    // instantiate with keys to collect participant ids
    async instantiate(stub) {

        let emptyList = [];
        await stub.putState('Admin', Buffer.from(JSON.stringify(emptyList)));
        await stub.putState('Maintenance', Buffer.from(JSON.stringify(emptyList)));
        await stub.putState('Staffing', Buffer.from(JSON.stringify(emptyList)));
        await stub.putState('Equipment', Buffer.from(JSON.stringify(emptyList)));
        await stub.putState('Audit', Buffer.from(JSON.stringify(emptyList)));
    }

    // add a admin object to the blockchain state identifited by the adminId
    async RegisterAdmin(stub, adminId) {

        let admin = {
            id: adminId,
            type: 'admin',
        };
        await stub.putState(adminId, Buffer.from(JSON.stringify(admin)));

        //add adminId to 'admin' key
        let data = await stub.getState('admin');
        if (data) {
            let admin = JSON.parse(data.toString());
            admin.push(adminId);
            await stub.putState('admin', Buffer.from(JSON.stringify(admin)));
        } else {
            throw new Error('not admin');
        }

        // return admin object
        return JSON.stringify(admin);
    }

    // add a Maintenance object to the blockchain state identifited by the maintenanceId
    async RegisterMaintenance(stub, maintenanceId) {

        let maintenance = {
            id: maintenanceId,
            type: 'maintenance',
        };
        await stub.putState(maintenanceId, Buffer.from(JSON.stringify(maintenance)));

        // add maintenanceId to 'maintenance' key
        let data = await stub.getState('maintenance');
        if (data) {
            let maintenance = JSON.parse(data.toString());
            maintenance.push(maintenanceId);
            await stub.putState('maintenance', Buffer.from(JSON.stringify(maintenance)));
        } else {
            throw new Error('no maintenance found');
        }

        // return maintenance object
        return JSON.stringify(maintenance);
    }

    // add a staffing object to the blockchain state identifited by the staffingId
    async RegisterStaffing(stub, staffingId, companyName) {

        let staffing = {
            id: staffingId,
            companyName: companyName,
            type: 'staffing',
        };
        await stub.putState(staffingId, Buffer.from(JSON.stringify(staffing)));

        // add staffingId to 'staffing' key
        let data = await stub.getState('staffing');
        if (data) {
            let staffing = JSON.parse(data.toString());
            staffing.push(staffingId);
            await stub.putState('staffing', Buffer.from(JSON.stringify(staffing)));
        } else {
            throw new Error('not staffing');
        }

        // return staffing object
        return JSON.stringify(staffing);
    }

    // add a equipment object to the blockchain state identifited by the equipmentId
    async Registerequipment(stub, equipmentId, companyName) {

        let equipment = {
            id: equipmentId,
            companyName: companyName,
            type: 'equipment',
        };
        await stub.putState(equipmentId, Buffer.from(JSON.stringify(equipment)));

        //add equipmentId to 'equipment' key
        let data = await stub.getState('equipment');
        if (data) {
            let equipment = JSON.parse(data.toString());
            equipment.push(equipmentId);
            await stub.putState('equipment', Buffer.from(JSON.stringify(equipment)));
        } else {
            throw new Error('not equipment');
        }

        // return equipment object
        return JSON.stringify(equipment);
    }

    // add a audit object to the blockchain state identifited by the auditId
    async Registeraudit(stub, auditId) {

        //store audit data identified by auditId
        let audit = {
            id: auditId,
            type: 'audit',
        };
        await stub.putState(auditId, Buffer.from(JSON.stringify(audit)));

        //add auditId to 'audit' key
        const data = await stub.getState('audit');
        if (data) {
            let audit = JSON.parse(data.toString());
            audit.push(auditId);
            await stub.putState('audit', Buffer.from(JSON.stringify(audit)));
        } else {
            throw new Error('audit not found');
        }

        // return audit object
        return JSON.stringify(audit);
    }

    // add an pipe_maintenance object to the blockchain state identifited by the pipe_maintenanceNumber
    async Createpipe_maintenance(stub, adminId, maintenanceId, auditId, pipe_maintenanceNumber, name, staffReq, equipmentReq, amount) {

        // verify adminId
        let adminData = await stub.getState(adminId);
        let admin;
        if (adminData) {
            admin = JSON.parse(adminData.toString());
            if (admin.type !== 'admin') {
                throw new Error('admin not identified');
            }
        } else {
            throw new Error('admin not found');
        }

        // verify maintenanceId
        let maintenanceData = await stub.getState(maintenanceId);
        let maintenance;
        if (maintenanceData) {
            maintenance = JSON.parse(maintenanceData.toString());
            if (maintenance.type !== 'maintenance') {
                throw new Error('maintenance not identified');
            }
        } else {
            throw new Error('maintenance not found');
        }

        // verify auditId
        let auditData = await stub.getState(auditId);
        let audit;
        if (auditData) {
            audit = JSON.parse(auditData.toString());
            if (audit.type !== 'audit') {
                throw new Error('audit not identified');
            }
        } else {
            throw new Error('audit not found');
        }

        let pipe_maintenance = {
            pipe_maintenanceNumber: pipe_maintenanceNumber,
            name: name,
            status: JSON.stringify(pipe_maintenanceStatus.Created),
            amount: amount,
            staffReq: staffReq,
            equipmentReq: equipmentReq,
            adminId: adminId,
            maintenanceId: maintenanceId,
            staffingId: null,
            equipmentId: null,
            auditId: auditId
        };

        //add pipe_maintenance to admin
        admin.pipe_maintenances.push(pipe_maintenanceNumber);
        await stub.putState(adminId, Buffer.from(JSON.stringify(admin)));

        //add pipe_maintenance to maintenance
        maintenance.pipe_maintenances.push(pipe_maintenanceNumber);
        await stub.putState(maintenanceId, Buffer.from(JSON.stringify(maintenance)));

        //add pipe_maintenance to audit
        audit.pipe_maintenances.push(pipe_maintenanceNumber);
        await stub.putState(auditId, Buffer.from(JSON.stringify(audit)));

        //store pipe_maintenance identified by pipe_maintenanceNumber
        await stub.putState(pipe_maintenanceNumber, Buffer.from(JSON.stringify(pipe_maintenance)));

        // return audit object
        return JSON.stringify(pipe_maintenance);
    }

    async Accept(stub, pipe_maintenanceNumber, adminId, maintenanceId ) {

        // get pipe_maintenance json
        let data = await stub.getState(pipe_maintenanceNumber);
        let pipe_maintenance;
        if (data) {
            pipe_maintenance = JSON.parse(data.toString());
        } else {
            throw new Error('pipe_maintenance not found');
        }

        // verify adminId
        let adminData = await stub.getState(adminId);
        let admin;
        if (adminData) {
            admin = JSON.parse(adminData.toString());
            if (admin.type !== 'admin') {
                throw new Error('admin not identified');
            }
        } else {
            throw new Error('admin not found');
        }

        // verify maintenanceId
        let maintenanceData = await stub.getState(maintenanceId);
        let maintenance;
        if (maintenanceData) {
            maintenance = JSON.parse(maintenanceData.toString());
            if (maintenance.type !== 'maintenance') {
                throw new Error('maintenance not identified');
            }
        } else {
            throw new Error('maintenance not found');
        }



        // update pipe_maintenance status
        if (pipe_maintenance.status === JSON.stringify(pipe_maintenanceStatus.Created)) {
            pipe_maintenance.status = JSON.stringify(pipe_maintenanceStatus.Accepted);
            await stub.putState(pipe_maintenanceNumber, Buffer.from(JSON.stringify(pipe_maintenance)));

            //add pipe_maintenance to maintenance
            maintenance.pipe_maintenances.push(pipe_maintenanceNumber);
            await stub.putState(maintenanceId, Buffer.from(JSON.stringify(maintenance)));

            return JSON.stringify(pipe_maintenance);
        } else {
            throw new Error('pipe_maintenance not created');
        }
    }


    async pipe_maintenanceCancel(stub, pipe_maintenanceNumber, maintenanceId, adminId) {

        // get pipe_maintenance json
        let data = await stub.getState(pipe_maintenanceNumber);
        let pipe_maintenance;
        if (data) {
            pipe_maintenance = JSON.parse(data.toString());
        } else {
            throw new Error('pipe_maintenance not found');
        }

        // verify adminId
        let adminData = await stub.getState(adminId);
        let admin;
        if (adminData) {
            admin = JSON.parse(adminData.toString());
            if (admin.type !== 'admin') {
                throw new Error('admin not identified');
            }
        } else {
            throw new Error('admin not found');
        }

        // verify maintenanceId
        let maintenanceData = await stub.getState(maintenanceId);
        let maintenance;
        if (maintenanceData) {
            maintenance = JSON.parse(maintenanceData.toString());
            if (maintenance.type !== 'maintenance') {
                throw new Error('maintenance not identified');
            }
        } else {
            throw new Error('maintenance not found');
        }

        //update pipe_maintenance
        if (pipe_maintenance.status === JSON.stringify(pipe_maintenanceStatus.Created) || pipe_maintenance.status === JSON.stringify(pipe_maintenanceStatus.Accepted)) {
            pipe_maintenance.status = JSON.stringify(pipe_maintenanceStatus.Cancelled);
            await stub.putState(pipe_maintenanceNumber, Buffer.from(JSON.stringify(pipe_maintenance)));
            return JSON.stringify(pipe_maintenance);
        } else {
            throw new Error('pipe_maintenance not created or accept pipe_maintenanceed');
        }
    }


    async staffingRequest(stub, pipe_maintenanceNumber, maintenanceId, staffingId, ) {

        //get pipe_maintenance json
        let data = await stub.getState(pipe_maintenanceNumber);
        let pipe_maintenance;
        if (data) {
            pipe_maintenance = JSON.parse(data.toString());
        } else {
            throw new Error('pipe_maintenance not found');
        }

        //verify maintenanceId
        let maintenanceData = await stub.getState(maintenanceId);
        let maintenance;
        if (maintenanceData) {
            maintenance = JSON.parse(maintenanceData.toString());
            if (maintenance.type !== 'maintenance') {
                throw new Error('maintenance not identified');
            }
        } else {
            throw new Error('maintenance not found');
        }

        // verify staffingId
        let staffingData = await stub.getState(staffingId);
        let staffing;
        if (staffingData) {
            staffing = JSON.parse(staffingData.toSCreatetring());
            if (staffing.type !== 'staffing') {
                throw new Error('staffing not identified');
            }
        } else {
            throw new Error('staffing not found');
        }

        //update pipe_maintenance
        if (pipe_maintenance.status === JSON.stringify(pipe_maintenanceStatus.Bought)) {
            pipe_maintenance.staffingId = staffingId;
            pipe_maintenance.status = JSON.stringify(pipe_maintenanceStatus.pipe_maintenanceed);
            await stub.putState(pipe_maintenanceNumber, Buffer.from(JSON.stringify(pipe_maintenance)));

            // add pipe_maintenance to staffing
            staffing.pipe_maintenances.push(pipe_maintenanceNumber);
            await stub.putState(staffingId, Buffer.from(JSON.stringify(staffing)));

            return JSON.stringify(pipe_maintenance);
        } else {
            throw new Error('pipe_maintenance status not bought');
        }
    }

    async EquipmentRequest(stub, pipe_maintenanceNumber, maintenanceId, equipmentId,) {

        // get pipe_maintenance json
        let data = await stub.getState(pipe_maintenanceNumber);
        let pipe_maintenance;
        if (data) {
            pipe_maintenance = JSON.parse(data.toString());
        } else {
            throw new Error('pipe_maintenance not found');
        }

        // verify equipmentId
        let equipmentData = await stub.getState(equipmentId);
        let equipment;
        if (equipmentData) {
            equipment = JSON.parse(equipmentData.toString());
            if (equipment.type !== 'equipment') {
                throw new Error('equipment not identified');
            }
        } else {
            throw new Error('equipment not found');
        }

        // verify maintenanceId
        let maintenanceData = await stub.getState(maintenanceId);
        let maintenance;
        if (maintenanceData) {
            maintenance = JSON.parse(maintenanceData.toString());
            if (maintenance.type !== 'maintenance') {
                throw new Error('maintenance not identified');
            }
        } else {
            throw new Error('maintenance not found');
        }

        // update pipe_maintenance
        if (pipe_maintenance.status === JSON.stringify(pipe_maintenanceStatus.pipe_maintenanceed) || pipe_maintenance.status === JSON.stringify(pipe_maintenanceStatus.Backpipe_maintenanceed)) {

            pipe_maintenance.maintenanceId = maintenanceId;
            pipe_maintenance.status = JSON.stringify(pipe_maintenanceStatus.ShipRequest);
            await stub.putState(pipe_maintenanceNumber, Buffer.from(JSON.stringify(pipe_maintenance)));

            // add pipe_maintenance to staffing
            maintenance.pipe_maintenances.push(pipe_maintenanceNumber);
            await stub.putState(maintenanceId, Buffer.from(JSON.stringify(maintenance)));

            return JSON.stringify(pipe_maintenance);

        } else {
            throw new Error('pipe_maintenance status not created or accepted');
        }
    }

    async Reviewinging(stub, pipe_maintenanceNumber, staffingId, ReviewStatus) {

        // get pipe_maintenance json
        let data = await stub.getState(pipe_maintenanceNumber);
        let pipe_maintenance;
        if (data) {
            pipe_maintenance = JSON.parse(data.toString());
        } else {
            throw new Error('pipe_maintenance not found');
        }

        // verify staffingId
        let staffingData = await stub.getState(staffingId);
        let staffing;
        if (staffingData) {
            staffing = JSON.parse(staffingData.toString());
            if (staffing.type !== 'staffing') {
                throw new Error('staffing not identified');
            }
        } else {
            throw new Error('staffing not found');
        }

        // update pipe_maintenance
        if (pipe_maintenance.status === JSON.stringify(pipe_maintenanceStatus.reviewRequest) || pipe_maintenance.status.code === JSON.stringify(pipe_maintenanceStatus.Reviewing.code)) {

            let _status = pipe_maintenanceStatus.Reviewing;
            _status.text += '  ' + ReviewStatus;
            pipe_maintenance.status = JSON.stringify(_status);

            await stub.putState(pipe_maintenanceNumber, Buffer.from(JSON.stringify(pipe_maintenance)));
            return JSON.stringify(pipe_maintenance);
        } else {
            throw new Error('pipe_maintenance review not requested ');
        }
    }


    async Approved(stub, pipe_maintenanceNumber, staffingId) {

        // get pipe_maintenance json
        let data = await stub.getState(pipe_maintenanceNumber);
        let pipe_maintenance;
        if (data) {
            pipe_maintenance = JSON.parse(data.toString());
        } else {
            throw new Error('pipe_maintenance not found');
        }

        // verify staffingId
        let staffingData = await stub.getState(staffingId);
        let staffing;
        if (staffingData) {
            staffing = JSON.parse(staffingData.toString());
            if (staffing.type !== 'staffing') {
                throw new Error('staffing not identified');
            }
        } else {
            throw new Error('staffing not found');
        }

        // update pipe_maintenance
        if (pipe_maintenance.status === JSON.stringify(pipe_maintenanceStatus.reviewRequest) || (JSON.parse(pipe_maintenance.status).code === JSON.stringify(pipe_maintenanceStatus.Reviewing.code))) {

            pipe_maintenance.status = JSON.stringify(pipe_maintenanceStatus.Approved);
            await stub.putState(pipe_maintenanceNumber, Buffer.from(JSON.stringify(pipe_maintenance)));
            return JSON.stringify(pipe_maintenance);
        } else {
            throw new Error('pipe_maintenance status review not requested or approved');
        }
    }

    async RequestStatus(stub, pipe_maintenanceNumber, maintenanceId, auditId) {

        // get pipe_maintenance json
        let data = await stub.getState(pipe_maintenanceNumber);
        let pipe_maintenance;
        if (data) {
            pipe_maintenance = JSON.parse(data.toString());
        } else {
            throw new Error('pipe_maintenance not found');
        }

        // verify maintenanceId
        let maintenanceData = await stub.getState(maintenanceId);
        let maintenance;
        if (maintenanceData) {
            maintenance = JSON.parse(maintenanceData.toString());
            if (maintenance.type !== 'maintenance') {
                throw new Error('maintenance not identified');
            }
        } else {
            throw new Error('maintenance not found');
        }

        // verify auditId
        let auditData = await stub.getState(auditId);
        let audit;
        if (auditData) {
            audit = JSON.parse(auditData.toString());
            if (audit.type !== 'audit') {
                throw new Error('audit not identified');
            }
        } else {
            throw new Error('audit not found');
        }

        // update pipe_maintenance
        if ((JSON.parse(pipe_maintenance.status).text === pipe_maintenanceStatus.approved.text)) {

            pipe_maintenance.status = JSON.stringify(pipe_maintenanceStatus.StatusRequest);

            await stub.putState(pipe_maintenanceNumber, Buffer.from(JSON.stringify(pipe_maintenance)));
            return JSON.stringify(pipe_maintenance);
        } else {
            throw new Error('pipe_maintenance status not approved ');
        }
    }


    async AuthorizeStatus(stub, pipe_maintenanceNumber, adminId, auditId) {

        // get pipe_maintenance json
        let data = await stub.getState(pipe_maintenanceNumber);
        let pipe_maintenance;
        if (data) {
            pipe_maintenance = JSON.parse(data.toString());
        } else {
            throw new Error('pipe_maintenance not found');
        }

        // verify adminId
        let adminData = await stub.getState(adminId);
        let admin;
        if (adminData) {
            admin = JSON.parse(adminData.toString());
            if (admin.type !== 'admin') {
                throw new Error('admin not identified');
            }
        } else {
            throw new Error('admin not found');
        }

        // verify auditId
        let auditData = await stub.getState(auditId);
        let audit;
        if (auditData) {
            audit = JSON.parse(auditData.toString());
            if (audit.type !== 'audit') {
                throw new Error('audit not identified');
            }
        } else {
            throw new Error('audit not found');
        }

        //update pipe_maintenance
        if ((JSON.parse(pipe_maintenance.status).text === pipe_maintenanceStatus.StatusRequest.text)) {

            pipe_maintenance.status = JSON.stringify(pipe_maintenanceStatus.Authorize);

            await stub.putState(pipe_maintenanceNumber, Buffer.from(JSON.stringify(pipe_maintenance)));
            return JSON.stringify(pipe_maintenance);
        } else {
            throw new Error('pipe_maintenance status not payment requested or resolved');
        }
    }

    async complete(stub, pipe_maintenanceNumber, maintenanceId, auditId) {

        // get pipe_maintenance json
        let data = await stub.getState(pipe_maintenanceNumber);
        let pipe_maintenance;
        if (data) {
            pipe_maintenance = JSON.parse(data.toString());
        } else {
            throw new Error('pipe_maintenance not found');
        }

        // verify maintenanceId
        let maintenanceData = await stub.getState(maintenanceId);
        let maintenance;
        if (maintenanceData) {
            maintenance = JSON.parse(maintenanceData.toString());
            if (maintenance.type !== 'maintenance') {
                throw new Error('maintenance not identified');
            }
        } else {
            throw new Error('maintenance not found');
        }

        // verify auditId
        let auditData = await stub.getState(auditId);
        let audit;
        if (auditData) {
            audit = JSON.parse(auditData.toString());
            if (audit.type !== 'audit') {
                throw new Error('audit not identified');
            }
        } else {
            throw new Error('audit not found');
        }

        // update pipe_maintenance
        if (JSON.parse(pipe_maintenance.status).text === pipe_maintenanceStatus.Authorize.text) {

            pipe_maintenance.status = JSON.stringify(pipe_maintenanceStatus.complete);

            await stub.putState(pipe_maintenanceNumber, Buffer.from(JSON.stringify(pipe_maintenance)));
            return JSON.stringify(pipe_maintenance);
        } else {
            throw new Error('pipe_maintenance status not authorize as complete');
        }
    }


};

shim.start(new ActChain_OG());