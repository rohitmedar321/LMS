import bcrypt from 'bcryptjs';

const hash = async (password) => {
  try {
    return await bcrypt.hash(password, 10);
  } catch {
    // console.log('❌ Error in hashing');
    return;
  }
};

const compareHash = async (password, hashed) => {
  try {
    return await bcrypt.compare(password, hashed);
  } catch {
    // console.log('❌ Error in comparing');
    return;
  }
};

export {hash, compareHash}