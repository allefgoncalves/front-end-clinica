import { Link } from 'react-router-dom';
import styles from './Unauthorized.module.css';

export const Unauthorized = () => {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>Não autorizado</h1>
        <p>Você não tem permissão para acessar esta página. Entre em contato com o administrador ou selecione outra opção no menu.</p>
        <Link to="/" className={styles.button}>Voltar ao Painel</Link>
      </div>
    </div>
  );
};
