import axios from 'axios';

export const createPrintifyProduct = async (shopifyProductId, imageUrl) => {
  const response = await axios.post(
    'https://api.printify.com/v1/shops/YOUR_SHOP_ID/products.json',
    {
      title: 'Custom Art Product',
      print_provider_id: 1,
      blueprint_id: 1,
      user_defined_id: shopifyProductId,
      images: [{ src: imageUrl }],
    },
    {
      headers: {
        Authorization: 'Bearer YOUR_PRINTIFY_ACCESS_TOKEN',
      },
    }
  );
  return response.data;
};
