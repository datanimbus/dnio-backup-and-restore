async function mongoFind(collection, query) {
    const configDB = global.configDB;
    const result = await configDB.collection(collection).find(query, { projection: { _id: 1, name: 1, app: 1, label: 1 } }).sort({ _id: 1 }).toArray();
    return result;
}

async function mongoFindOne(collection, query) {
    const configDB = global.configDB;
    const result = await configDB.collection(collection).findOne(query);
    return result;
}

async function mongoInsert(collection, data) {
    const configDB = global.configDB;
    const result = await configDB.collection(collection).insertOne(data);
    return result;
}

async function mongoUpdate(collection, data) {
    const configDB = global.configDB;
    const result = await configDB.collection(collection).updateOne({ _id: data._id }, { $set: data });
    return result;
}

module.exports = {
    mongoFind,
    mongoFindOne,
    mongoInsert,
    mongoUpdate
};