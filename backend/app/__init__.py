"""Load environment variables from .env before any app module reads them."""

from dotenv import load_dotenv

load_dotenv()