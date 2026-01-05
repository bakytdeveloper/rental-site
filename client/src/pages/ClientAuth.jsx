import ClientRegister from '../components/Client/ClientRegister';
import ClientLogin from '../components/Client/ClientLogin';

const ClientAuth = ({ type }) => {
    return type === 'register' ? <ClientRegister /> : <ClientLogin />;
};

export default ClientAuth;