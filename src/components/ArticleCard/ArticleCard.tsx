import React from 'react';
import { Calendar, Eye } from 'lucide-react';
import type { Article } from '@/types';
import { formatTime } from '@/utils';
import styles from './ArticleCard.module.css';

interface ArticleCardProps {
  article: Article;
  onClick: () => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onClick }) => {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.coverWrapper}>
        <img
          className={styles.coverImage}
          src={article.coverImage}
          alt={article.title}
          loading="lazy"
        />
      </div>
      <div className={styles.body}>
        <div className={styles.title}>{article.title}</div>
        <div className={styles.summary}>{article.summary}</div>
        <div className={styles.footer}>
          <span className={styles.footerItem}>
            <Calendar className={styles.footerIcon} />
            {formatTime(article.publishedAt)}
          </span>
          <span className={styles.footerDivider}>|</span>
          <span>{article.source}</span>
          <span className={styles.footerDivider}>|</span>
          <span className={styles.footerItem}>
            <Eye className={styles.footerIcon} />
            {article.viewCount}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
