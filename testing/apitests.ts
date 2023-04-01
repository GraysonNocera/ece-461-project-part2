import axios from 'axios';

describe('API tests', () => {
  it('should create a package', async () => {
    const response = await axios.post('http://localhost:3000/packages', {
      name: 'test-package',
      version: '1.0.0',
      ID: '1234',
    });

    expect(response.status).toBe(200);
    expect(response.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'test-package',
          version: '1.0.0',
          ID: '1234',
        }),
      ]),
    );
  });

  it('should get a package by name', async () => {
    const response = await axios.get('http://localhost:3000/package/byName/test-package');

    expect(response.status).toBe(200);
    expect(response.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'test-package',
          version: '1.0.0',
          ID: '1234',
        }),
      ]),
    );
  });

  //   it('should get a list of packages', async () => {
  //     const response = await axios.get('http://localhost:3000/package');

  //     expect(response.status).toBe(200);
  //     expect(Array.isArray(response.data)).toBe(true);
  //   });
});
