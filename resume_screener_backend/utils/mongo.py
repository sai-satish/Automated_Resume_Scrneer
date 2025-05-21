from motor.motor_asyncio import AsyncIOMotorClient
from odmantic import AIOEngine
from urllib.parse import quote_plus
import os
from dotenv import loadenv
loadenv()

username = quote_plus(os.getenv("AZURE_COSMOS_DB_USERNAME"))
password = quote_plus(os.getenv("AZURE_COSMOS_DB_KEY"))

def get_engine():
    client = AsyncIOMotorClient(f"mongodb+srv://{username}:{password}@resume-screener-cosmosdb-resource.global.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000")
    engine = AIOEngine(client=client, database="job-posting")

    return engine


