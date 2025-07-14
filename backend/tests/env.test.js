const mongoose = require('mongoose');

describe('Environment checks', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('startServer exits when env vars missing', async () => {
    delete process.env.MONGO_URI;
    delete process.env.JWT_SECRET;
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    const { startServer } = require('..');
    await expect(startServer()).rejects.toThrow('exit');
    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });

});
