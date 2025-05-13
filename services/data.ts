//TODO: json images juiste paden maken

import { Brand, Guitar } from "../types";

let guitarCache: Guitar[] = [];
let brandCache: Brand[] = [];

export async function fetchGuitars(): Promise<Guitar[]> {
    if (guitarCache.length === 0) {
        const res = await fetch('https://raw.githubusercontent.com/YornPopcorn/Json-Gitaren/refs/heads/main/gitaren.json');
        guitarCache = await res.json();
    }
    return guitarCache;
}

export async function fetchBrands(): Promise<Brand[]> {
    if (brandCache.length === 0) {
        const res = await fetch('https://raw.githubusercontent.com/YornPopcorn/Json-Gitaren/refs/heads/main/brand.json');
        brandCache = await res.json();
    }
    return brandCache;
}

export async function getGuitarById(id: string): Promise<Guitar | null> {
    const guitars :Guitar[] = await fetchGuitars();
    return guitars.find(guitar => guitar.id.toString() === id) || null;
}

export async function getBrandById(id: string): Promise<Brand | null> {
    const brands = await fetchBrands();
    return brands.find(brand => brand.id.toString() === id) || null;
}

export async function getGuitarsByBrandId(brandId: string): Promise<Guitar[]> {
    const guitars = await fetchGuitars();
    const brands = await fetchBrands();

    // Find the brand to get its name (for fallback matching)
    const brand = brands.find(b => b.id.toString() === brandId);

    return guitars.filter(guitar => {
        // Case 1: Guitar has embedded brand with matching ID
        if (guitar.brand?.id.toString() === brandId) return true;

        // Case 2: Guitar references brand ID directly (if you had guitar.brandId)
        if ('brandId' in guitar && guitar.brandId?.toString() === brandId) return true;

        // Case 3: Fallback - match by brand name if IDs don't match
        if (brand && guitar.brand?.brandName === brand.brandName) return true;

        return false;
    });
}

// New function to get all brands with their guitars count
export async function getBrandsWithCounts(): Promise<Array<Brand & { guitarCount: number }>> {
    const brands = await fetchBrands();
    const guitars = await fetchGuitars();

    return brands.map(brand => {
        const count = guitars.filter(guitar =>
            guitar.brand?.id === brand.id ||
            guitar.brand?.brandName === brand.brandName
        ).length;

        return { ...brand, guitarCount: count };
    });
}