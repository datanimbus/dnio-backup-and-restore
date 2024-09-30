const router = require('express').Router({ mergeParams: true });
const mongoService = require('./mongo-service');

router.get('/apps', async (req, res) => {
    const result = await mongoService.mongoFind('userMgmt.apps');
    res.json(result);
});

router.get('/:app/connectors', async (req, res) => {
    const result = await mongoService.mongoFind('config.connectors', { app: req.params.app });
    res.json(result);
});

router.get('/:app/dataformats', async (req, res) => {
    const result = await mongoService.mongoFind('b2b.dataFormats', { app: req.params.app });
    res.json(result);
});

router.get('/:app/dataservices', async (req, res) => {
    const result = await mongoService.mongoFind('services', { app: req.params.app });
    res.json(result);
});

router.get('/:app/agents', async (req, res) => {
    const result = await mongoService.mongoFind('b2b.agents', { app: req.params.app });
    res.json(result);
});

router.get('/:app/plugins', async (req, res) => {
    const result = await mongoService.mongoFind('b2b.my-nodes', { app: req.params.app });
    res.json(result);
});

router.get('/:app/customplugins', async (req, res) => {
    const result = await mongoService.mongoFind('b2b.nodes', { app: req.params.app });
    res.json(result);
});

router.get('/:app/formulas', async (req, res) => {
    const result = await mongoService.mongoFind('metadata.mapper.formulas', { app: req.params.app });
    res.json(result);
});

router.get('/:app/groups', async (req, res) => {
    const result = await mongoService.mongoFind('userMgmt.groups', { app: req.params.app });
    res.json(result);
});

router.get('/:app/datapipes', async (req, res) => {
    const result = await mongoService.mongoFind('b2b.flows', { app: req.params.app });
    res.json(result);
});

module.exports = router;