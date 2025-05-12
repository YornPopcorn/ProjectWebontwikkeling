import express from 'express';
import {
    fetchBrands,
    fetchGuitars,
    getBrandById,
    getGuitarById,
    getGuitarsByBrandId,
    getBrandsWithCounts  // Added the new function
} from '../services/data';
import { Brand, Guitar } from "../types";

const router = express.Router();

router.get('/guitars', async (req, res) => {
    try {
        const [guitars, brands] = await Promise.all([
            fetchGuitars(),
            fetchBrands()
        ]);
        res.render('index', {
            guitars,
            brands,
            title: "All Guitars"
        });
    } catch (error) {
        console.error('Error fetching guitars:', error);
        res.status(500).render('error', { message: 'Failed to load guitars' });
    }
});

router.get('/guitar/:id', async (req, res) => {
    try {
        const guitar = await getGuitarById(req.params.id);
        if (!guitar) {
            return res.status(404).render('error', {
                message: `Guitar with ID ${req.params.id} not found`
            });
        }
        res.render('detail', {
            guitar,
            title: guitar.name
        });
    } catch (error) {
        console.error('Error fetching guitar:', error);
        res.status(500).render('error', { message: 'Failed to load guitar details' });
    }
});

router.get('/brand/:id', async (req, res) => {
    try {
        const [brand, guitars] = await Promise.all([
            getBrandById(req.params.id),
            getGuitarsByBrandId(req.params.id)
        ]);

        if (!brand) {
            return res.status(404).render('error', {
                message: `Brand with ID ${req.params.id} not found`
            });
        }

        res.render('brand', {
            brand,
            guitars,
            title: `${brand.brandName} Guitars`
        });
    } catch (error) {
        console.error('Error fetching brand:', error);
        res.status(500).render('error', { message: 'Failed to load brand details' });
    }
});

// NEW: Route to show all brands with guitar counts
router.get('/brands', async (req, res) => {
    try {
        const brands = await getBrandsWithCounts();
        res.render('brands', {
            brands,
            title: "All Brands"
        });
    } catch (error) {
        console.error('Error fetching brands:', error);
        res.status(500).render('error', { message: 'Failed to load brands' });
    }
});


export default router;