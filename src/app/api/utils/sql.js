import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;

const NullishQueryFunction = () => {
  throw new Error(
    'No database connection string was provided. Please set DATABASE_URL in your environment.'
  );
};
NullishQueryFunction.transaction = () => {
  throw new Error('No database connection string was provided.');
};

const sql = connectionString
  ? postgres(connectionString, {
      ssl: 'require',
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
    })
  : NullishQueryFunction;

export default sql;
