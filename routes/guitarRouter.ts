import express from 'express';
import {
    getBrands,
    getGuitars,
    getBrandById,
    getGuitarById,
    getGuitarsByBrandId,
    getBrandsWithCounts,
    updateGuitar
} from '../services/dbService';


const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const [guitars, brands] = await Promise.all([
            getGuitars(),
            getBrands()
        ]);
        res.render('index', {
            guitars,
            brands,
            title: "home",
            activeTab: 'home'
        });
    } catch (error) {
        console.error('Error fetching guitars:', error);
        res.status(500).render('error', { message: 'Failed to load guitars' });
    }
});

router.get('/guitars', async (req, res) => {
    res.redirect('/');
});

// New route for guitarOverView
router.get('/guitarOverView', async (req, res) => {
    try {
        const guitars = await getGuitars();
        res.render('guitarOverView', {
            guitars,
            title: "Our Guitar Collection",
            activeTab: 'guitars'
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
        res.render('guitarDetail', {
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

        res.render('brandDetail', {
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



router.get('/guitar/:id/edit', async (req, res) => {
    const guitar = await getGuitarById(req.params.id);
    const brands = await getBrands();
    if (!guitar) {
        return res.status(404).render('error', { message: 'Guitar not found' });
    }
    res.render('editGuitar', { guitar, brands, title: "Edit Guitar" });
});


router.post('/guitar/:id/edit', async (req, res) => {
    const guitarId = req.params.id;
    const formData = req.body;
    
    try {
        // Convert brandId to a number
        formData.brandId = parseInt(formData.brandId);
        
        // Handle the boolean value for active
        formData.active = formData.active === 'on';
        
        // Convert age to a number
        formData.age = parseInt(formData.age);
        
        // Get the brand information
        const brand = await getBrandById(formData.brandId);
        
        // Update the guitar with the form data
        const updatedGuitar = {
            name: formData.name,
            description: formData.description,
            age: formData.age,
            active: formData.active,
            type: formData.type,
            brand: brand || undefined,
        };

        // Call a function to update the guitar in the database
        await updateGuitar(parseInt(guitarId), updatedGuitar);
        
        // Redirect to the guitar detail page
        res.redirect(`/guitar/${guitarId}`);
    } catch (error) {
        console.error('Error updating guitar:', error);
        res.status(500).render('error', { message: 'Failed to update guitar' });
    }
});

export default router;