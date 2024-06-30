import axios from 'axios';

export const createShopifyProduct = async (imageUrl) => {
  const response = await axios.post(
    'https://your-shopify-store.myshopify.com/admin/api/2021-04/products.json',
    {
      product: {
        title: 'Custom Art Product',
        images: [{ src: imageUrl }],
      },
    },
    {
      headers: {
        'X-Shopify-Access-Token': 'YOUR_SHOPIFY_ACCESS_TOKEN',
      },
    }
  );
  return response.data.product;
};
