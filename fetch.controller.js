const router = require('express').Router({ mergeParams: true });

router.get('/apps', async (req, res) => {
    const configDB = global.configDB;
    const result = await configDB.collection('userMgmt.apps').find({}, { projection: { _id: 1, name: 1, app: 1, label: 1 } }).sort({ _id: 1 }).toArray();
    res.json(result);
});

router.get('/:app/connectors', async (req, res) => {
    const configDB = global.configDB;
    const result = await configDB.collection('config.connectors').find({ app: req.params.app }, { projection: { _id: 1, name: 1, app: 1, label: 1 } }).sort({ name: 1 }).toArray();
    res.json(result);
});

router.get('/:app/dataformats', async (req, res) => {
    const configDB = global.configDB;
    const result = await configDB.collection('b2b.dataFormats').find({ app: req.params.app }, { projection: { _id: 1, name: 1, app: 1, label: 1 } }).sort({ name: 1 }).toArray();
    res.json(result);
});

router.get('/:app/dataservices', async (req, res) => {
    const configDB = global.configDB;
    const result = await configDB.collection('services').find({ app: req.params.app }, { projection: { _id: 1, name: 1, app: 1, label: 1 } }).sort({ name: 1 }).toArray();
    res.json(result);
});

router.get('/:app/agents', async (req, res) => {
    const configDB = global.configDB;
    const result = await configDB.collection('b2b.agents').find({ app: req.params.app }, { projection: { _id: 1, name: 1, app: 1, label: 1 } }).sort({ name: 1 }).toArray();
    res.json(result);
});

router.get('/:app/plugins', async (req, res) => {
    const configDB = global.configDB;
    const result = await configDB.collection('b2b.my-nodes').find({ app: req.params.app }, { projection: { _id: 1, name: 1, app: 1, label: 1 } }).sort({ name: 1 }).toArray();
    res.json(result);
});

router.get('/:app/customplugins', async (req, res) => {
    const configDB = global.configDB;
    const result = await configDB.collection('b2b.nodes').find({ app: req.params.app }, { projection: { _id: 1, name: 1, app: 1, label: 1 } }).sort({ name: 1 }).toArray();
    res.json(result);
});

router.get('/:app/formulas', async (req, res) => {
    const configDB = global.configDB;
    const result = await configDB.collection('metadata.mapper.formulas').find({ app: req.params.app }, { projection: { _id: 1, name: 1, app: 1, label: 1 } }).sort({ name: 1 }).toArray();
    res.json(result);
});

router.get('/:app/groups', async (req, res) => {
    const configDB = global.configDB;
    const result = await configDB.collection('userMgmt.groups').find({ app: req.params.app }, { projection: { _id: 1, name: 1, app: 1, label: 1 } }).sort({ name: 1 }).toArray();
    res.json(result);
});

router.get('/:app/datapipes', async (req, res) => {
    const configDB = global.configDB;
    const result = await configDB.collection('b2b.flows').find({ app: req.params.app }).sort({ name: 1 }).toArray();
    res.json(result);
});

module.exports = router;