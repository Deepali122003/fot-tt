from bson.objectid import ObjectId

class BatchModel:
    def __init__(self, db):
        self.collection = db['batches']

    # -------------------------------
    # GET ALL BATCHES
    # -------------------------------
    def get_all_batches(self):
        batches = list(self.collection.find({}, {
            "name": 1,
            "year": 1,
            "semester": 1,
            "department": 1,
            "batch_size": 1
        }))

        for batch in batches:
            batch["_id"] = str(batch["_id"])

        return batches

    # -------------------------------
    # CREATE BATCH (FIXED)
    # -------------------------------
    def create_batch(self, data):
        batch_data = {
            "name": data.get("name"),
            "year": data.get("year"),
            "semester": data.get("semester"),
            "department": data.get("department"),
            "batch_size": data.get("batch_size", 0)
        }

        return self.collection.insert_one(batch_data)

    # -------------------------------
    # GET SINGLE BATCH
    # -------------------------------
    def get_batch_by_id(self, batch_id):
        try:
            batch = self.collection.find_one({"_id": ObjectId(batch_id)})

            if batch:
                batch["_id"] = str(batch["_id"])

            return batch
        except:
            return None

    # -------------------------------
    # DELETE BATCH
    # -------------------------------
    def delete_batch(self, batch_id):
        try:
            return self.collection.delete_one({"_id": ObjectId(batch_id)})
        except:
            return None

    # -------------------------------
    # UPDATE BATCH
    # -------------------------------
    def update_batch(self, batch_id, data):
        try:
            return self.collection.update_one(
                {"_id": ObjectId(batch_id)},
                {"$set": data}
            )
        except:
            return None