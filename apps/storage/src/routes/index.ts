import { Router } from 'express';
import fileRoutes from './file/index.js';
import folderRoutes from './folder/index.js';

const allRoutes = [fileRoutes, folderRoutes];

export default allRoutes;

