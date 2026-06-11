# # from bson.objectid import ObjectId

# # class BatchModel:
# #     def __init__(self, db):
# #         self.collection = db['batches']

# #     # -------------------------------
# #     # GET ALL BATCHES
# #     # -------------------------------
# #     def get_all_batches(self):
# #         batches = list(self.collection.find({}, {
# #             "name": 1,
# #             "semester": 1,
# #             "department": 1,
# #             "batch_size": 1
# #         }))

# #         # Convert ObjectId → string
# #         for batch in batches:
# #             batch["_id"] = str(batch["_id"])

# #         return batches

# #     # -------------------------------
# #     # CREATE BATCH
# #     # -------------------------------
# #     def create_batch(self, name,year, semester, department, batch_size):
# #         batch_data = {
# #             "name": name,
# #             "year":year,
# #             "semester": semester,
# #             "department": department,
# #             "batch_size": batch_size
# #         }

# #         return self.collection.insert_one(batch_data)

# #     # -------------------------------
# #     # GET SINGLE BATCH BY ID
# #     # -------------------------------
# #     def get_batch_by_id(self, batch_id):
# #         batch = self.collection.find_one({"_id": ObjectId(batch_id)})

# #         if batch:
# #             batch["_id"] = str(batch["_id"])

# #         return batch

# #     # -------------------------------
# #     # DELETE BATCH
# #     # -------------------------------
# #     def delete_batch(self, batch_id):
# #         return self.collection.delete_one({"_id": ObjectId(batch_id)})

# #     # -------------------------------
# #     # UPDATE BATCH
# #     # -------------------------------
# #     def update_batch(self, batch_id, data):
# #         return self.collection.update_one(
# #             {"_id": ObjectId(batch_id)},
# #             {"$set": data}
# #         )
# # class BatchModel:
# #     def __init__(self, db):
# #         self.collection = db['batches']

# #     def get_all_batches(self):
# #         # Added "batch_size": 1 to the projection to include it in the results
# #         return list(self.collection.find({}, {"name": 1, "batch_size": 1}))

# #     def create_batch(self, name, semester, department, batch_size):
# #         batch_data = {
# #             "name": name, 


# #             "semester": semester,
# #             "department": department,
# #             "batch_size": batch_size  # Now storing the size of the batch
# #         }
# #         return self.collection.insert_one(batch_data)



# from bson.objectid import ObjectId

# class BatchModel:
#     def __init__(self, db):
#         self.collection = db['batches']

#     # -------------------------------
#     # GET ALL BATCHES
#     # -------------------------------
#     def get_all_batches(self):
#         batches = list(self.collection.find({}, {
#             "name": 1,
#             "year": 1,
#             "semester": 1,
#             "department": 1,
#             "batch_size": 1
#         }))

#         for batch in batches:
#             batch["_id"] = str(batch["_id"])

#         return batches

#     # -------------------------------
#     # CREATE BATCH
#     # -------------------------------
#     def create_batch(self, data):
#         batch_data = {
#             "name": data.get("name"),
#             "year": data.get("year"),
#             "semester": data.get("semester"),
#             "department": data.get("department"),
#             "batch_size": data.get("batch_size", 0)
#         }

#         return self.collection.insert_one(batch_data)

#     # -------------------------------
#     # GET SINGLE BATCH BY ID
#     # -------------------------------
#     def get_batch_by_id(self, batch_id):
#         try:
#             batch = self.collection.find_one({"_id": ObjectId(batch_id)})

#             if batch:
#                 batch["_id"] = str(batch["_id"])

#             return batch
#         except:
#             return None

#     # -------------------------------
#     # DELETE BATCH
#     # -------------------------------
#     def delete_batch(self, batch_id):
#         try:
#             return self.collection.delete_one({"_id": ObjectId(batch_id)})
#         except:
#             return None

#     # -------------------------------
#     # UPDATE BATCH
#     # -------------------------------
#     def update_batch(self, batch_id, data):
#         try:
#             return self.collection.update_one(
#                 {"_id": ObjectId(batch_id)},
#                 {"$set": data}
#             )
#         except:
#             return None


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