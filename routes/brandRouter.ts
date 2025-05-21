import express from 'express';
import {
    getBrands,
    getGuitars,
    getBrandById,
    getGuitarsByBrandId,
    getFilteredAndSortedBrands
} from '../services/dbService';

const router = express.Router();

// Haal unieke gitaartypen op
async function getUniqueGuitarTypes(): Promise<string[]> {
    const guitars = await getGuitars();
    const types = new Set(guitars.map(guitar => guitar.type));
    return Array.from(types);
}

router.get('/brands', async (req, res) => {
    // Wijzig dit om te verwijzen naar BrandOverView in plaats van brands
    res.redirect('/brandOverView');
});

router.get('/brandOverView', async (req, res) => {
    try {
        const { sort, direction, filter } = req.query;

        const brands = await getFilteredAndSortedBrands(
            filter as string,
            sort as string || 'brandName',
            direction as 'asc' | 'desc' || 'asc'
        );

        const guitarTypes = await getUniqueGuitarTypes();

        res.render('BrandOverView', {  // Let op de hoofdletter B in 'BrandOverView'
            brands,
            guitarTypes,
            title: "Our Guitar Brands",
            activeTab: 'brands',
            currentSort: sort || 'brandName',
            currentDirection: direction || 'asc',
            currentFilter: filter || ''
        });
    } catch (error) {
        console.error('Error fetching brands:', error);
        res.status(500).render('error', { message: 'Failed to load brands' });
    }
});

// Voeg deze route toe als die nog niet bestaat in guitarRouter
router.get('/guitars/type/:type', async (req, res) => {
    try {
        const guitars = await getGuitars();
        const typeFilter = req.params.type.toLowerCase();
        const filteredGuitars = guitars.filter(g => g.type.toLowerCase() === typeFilter);
        const brands = await getBrands();

        res.render('guitarOverView', {
            guitars: filteredGuitars,
            brands,
            title: `${typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)} Guitars`,
            activeTab: 'guitars',
            currentFilter: '',
            currentSort: '',
            currentDirection: ''
        });
    } catch (error) {
        console.error('Error fetching guitars by type:', error);
        res.status(500).render('error', { message: 'Failed to load guitars' });
    }
});

export default router;