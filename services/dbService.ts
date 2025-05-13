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