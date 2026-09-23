"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const csv = [
    "Mã học viên,Họ và tên,Tổ,Khoá,Trạng thái,Ngày kích hoạt",
    "A01,Học viên A,1,1,ACTIVE,01/01/2026",
    "P01,Học viên P,1,1,PAUSED,01/01/2026",
    "N01,Học viên N,1,1,,01/01/2026",
    "G01,Học viên G,1,1,GRADUATED,01/01/2026",
    "B01,Học viên B,1,1,BANNED,01/01/2026"
].join("\n");

const windowObject = {
    dispatchEvent(){},
    crypto:require("node:crypto").webcrypto
};

const context = {
    window:windowObject,
    CustomEvent:function(name,init){
        this.type=name;
        this.detail=init && init.detail;
    },
    console,
    setTimeout,
    clearTimeout,
    Intl,
    Date,
    Map,
    Set,
    Promise,
    Uint32Array,
    fetch:async function(url){
        if(String(url).includes("gid=1603096683")){
            return{
                ok:true,
                text:async function(){
                    return csv;
                }
            };
        }

        throw new Error("Unexpected URL in test: " + url);
    }
};

vm.createContext(context);
vm.runInContext(
    fs.readFileSync("student-reward-core.js","utf8"),
    context,
    {filename:"student-reward-core.js"}
);

async function run(){
    const RS = windowObject.StudentRewardSystem;

    assert.equal((await RS.getStudentAccess("A01")).canAccess,true);
    assert.equal((await RS.getStudentAccess("P01")).status,"paused");
    assert.equal((await RS.getStudentAccess("P01")).canAccess,false);
    assert.equal((await RS.getStudentAccess("N01")).status,"pending");
    assert.equal((await RS.getStudentAccess("G01")).canDisplayPublicly,false);
    assert.equal((await RS.getStudentAccess("B01")).canSubmit,false);

    assert.equal((await RS.getStudentAccess("OLD01")).canAccess,true);

    RS.CONFIG.studentRegistryStrict=true;
    assert.equal((await RS.getStudentAccess("OLD01")).canAccess,false);

    assert.equal(
        (await RS.getStudentAccess("P01",{adminBypass:true})).canAccess,
        true
    );

    const visible = await RS.filterActiveStudents([
        {code:"A01"},
        {code:"P01"},
        {code:"N01"},
        {code:"G01"},
        {code:"B01"}
    ]);

    assert.deepEqual(
        Array.from(visible,item=>item.code),
        ["A01"]
    );

    await assert.rejects(
        RS.assertStudentActive("P01"),
        error =>
            error &&
            error.code === "STUDENT_ACCESS_DENIED" &&
            error.studentAccess.status === "paused"
    );

    await assert.rejects(
        RS.getStudentRewardProfile("P01",""),
        error =>
            error &&
            error.code === "STUDENT_ACCESS_DENIED"
    );

    console.log("student-status-gate: OK");
}

run().catch(function(error){
    console.error(error);
    process.exitCode=1;
});

