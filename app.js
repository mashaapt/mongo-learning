const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const circulationRepo = require('./repos/circulationRepo');
const data = require('./circulation.json');

const url = 'mongodb://localhost:27017';
const dbName = 'circulation';

async function main() {
    const client = new MongoClient(url);
    await client.connect();

    try {
        const results = await circulationRepo.loadData(data);
        // console.log(results.insertedCount, results.ops);
        assert.equal(data.length, results.insertedCount);
        
        const allData = await circulationRepo.get();
        assert.equal(data.length, allData.length);

        const filterData = await circulationRepo.get({Newspaper: allData[4].Newspaper});
        assert.deepEqual(filterData[0], allData[4]);
        // console.log('filtered data', filterData);

        const limitData = await circulationRepo.get({}, 3);
        assert.equal(limitData.length, 3);
        // console.log('limitData', limitData);

        const id = allData[4]._id.toString();
        const byId = await circulationRepo.getById(id);
        assert.deepEqual(byId, allData[4]);
        // console.log(`finding by id ${id}`, byId);

        const newItem = {
            "Newspaper": "My paper",
            "Daily Circulation, 2004": 1,
            "Daily Circulation, 2013": 2,
            "Change in Daily Circulation, 2004-2013": 100,
            "Pulitzer Prize Winners and Finalists, 1990-2003": 1,
            "Pulitzer Prize Winners and Finalists, 2004-2014": 1,
            "Pulitzer Prize Winners and Finalists, 1990-2014": 1
        }
        const addedItem = await circulationRepo.add(newItem);
        assert (addedItem._id);

        const addedItemquery = await circulationRepo.getById(addedItem._id);
        assert.deepEqual(addedItemquery, newItem);

        const updatedItem = await circulationRepo.update(addedItem._id, {
            "Newspaper": "My New paper",
            "Daily Circulation, 2004": 1,
            "Daily Circulation, 2013": 2,
            "Change in Daily Circulation, 2004-2013": 100,
            "Pulitzer Prize Winners and Finalists, 1990-2003": 1,
            "Pulitzer Prize Winners and Finalists, 2004-2014": 1,
            "Pulitzer Prize Winners and Finalists, 1990-2014": 1
        } );

        assert.equal(updatedItem.Newspaper, "My New paper");

        const newAddedQuery = await circulationRepo.getById(addedItem._id);
        assert.equal(newAddedQuery.Newspaper, "My New paper");

        const removed = await circulationRepo.remove(addedItem._id);
        assert(removed);
        const deletedItem = await circulationRepo.getById(addedItem._id);
        // console.log(deletedItem);
        assert.equal(deletedItem, null);

    } catch (error) {
        console.log(error);
    } finally {
        const admin = client.db(dbName).admin();
    
        await client.db(dbName).dropDatabase();
        // console.log(await admin.serverStatus());
        // console.log(await admin.listDatabases());
        client.close();

    }
    
}

main();