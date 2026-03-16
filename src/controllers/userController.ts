import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.ts";
import {users} from '../db/schema.ts';
import {db} from '../db/connection.ts';
