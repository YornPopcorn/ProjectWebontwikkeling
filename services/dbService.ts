import { brandsCollection, guitarsCollection } from "./db";
import { Brand, Guitar } from "../types";

export async function getGuitars(): Promise<Guitar[]> {
    return await guitarsCollection.find().toArray();
}

export async function getGuitarById(id: string): Promise<Guitar | null> {
    return await guitarsCollection.findOne({ id: parseInt(id) });
}

export async function getBrands(): Promise<Brand[]> {
    return await brandsCollection.find().toArray();
}

export async function getBrandById(id: string): Promise<Brand | null> {
    return await brandsCollection.findOne({ id: parseInt(id) });
}

export async function getGuitarsByBrandId(brandId: string): Promise<Guitar[]> {
    return await guitarsCollection.find({
        $or: [
            { "brand.id": parseInt(brandId) },
            { brandId: parseInt(brandId) }
        ]
    }).toArray();
}

export async function getBrandsWithCounts(): Promise<Array<Brand & { guitarCount: number }>> {
    const brands = await getBrands();
    const guitars = await getGuitars();

    return brands.map(brand => {
        const count = guitars.filter(g =>
            g.brand?.id === brand.id ||
            g.brand?.brandName === brand.brandName
        ).length;
        return { ...brand, guitarCount: count };
    });
}

export async function updateGuitar(id: number, data: Partial<Guitar>) {
    return await guitarsCollection.updateOne({ id }, { $set: data });
}
export async function getFilteredAndSortedBrands(
    filter: string = '',
    sortField: string = 'brandName',
    sortDirection: 'asc' | 'desc' = 'asc'
): Promise<Array<Brand & { guitarCount: number }>> {
    let query: any = {};
    let sortOptions: any = {};

    // Voeg filter toe als het is opgegeven
    if (filter) {
        query.$or = [
            { brandName: { $regex: filter, $options: 'i' } },
            { country: { $regex: filter, $options: 'i' } }
        ];
    }

    // Stel sorteervolgorde in
    sortOptions[sortField] = sortDirection === 'asc' ? 1 : -1;

    // Haal merken op met filter en sortering
    const brands = await brandsCollection.find(query).sort(sortOptions).toArray();
    
    // Voeg guitarCount toe aan elk merk
    const guitars = await getGuitars();
    return brands.map(brand => {
        const count = guitars.filter(g =>
            g.brand?.id === brand.id ||
            g.brand?.brandName === brand.brandName
        ).length;
        return { ...brand, guitarCount: count };
    });
}
export async function getFilteredAndSortedGuitars(
    filter: string = '',
    sortField: string = 'name',
    sortDirection: 'asc' | 'desc' = 'asc'
): Promise<Guitar[]> {
    let query: any = {};
    let sortOptions: any = {};

    // Voeg filter toe als het is opgegeven
    if (filter) {
        query.$or = [
            { name: { $regex: filter, $options: 'i' } },
            { description: { $regex: filter, $options: 'i' } },
            { type: { $regex: filter, $options: 'i' } }
        ];
    }

    // Stel sorteervolgorde in
    sortOptions[sortField] = sortDirection === 'asc' ? 1 : -1;

    // Haal gitaren op met filter en sortering
    return await guitarsCollection.find(query).sort(sortOptions).toArray();
}