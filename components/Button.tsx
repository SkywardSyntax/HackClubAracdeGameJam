import styles from './Button.module.css'

import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export default function Button(props: ButtonProps) {
  return <button type="button" className={styles.btn} {...props} />
}
