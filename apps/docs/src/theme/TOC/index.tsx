import {type ReactNode} from 'react';
import clsx from 'clsx';
import TOCItems from '@theme/TOCItems';
import type {Props} from '@theme/TOC';

import styles from './styles.module.css';

const LINK_CLASS_NAME = 'table-of-contents__link toc-highlight';
const LINK_ACTIVE_CLASS_NAME = 'table-of-contents__link--active';

export default function TOC({className, ...props}: Props): ReactNode {
  return (
    <div className={clsx(styles.tableOfContents, 'thin-scrollbar', className)}>
      <div className="nyx-toc-logo">
        <img
          src="/docs/img/nyx-mark-gold.svg"
          alt="Nyx"
          style={{width: 100, height: 100, display: 'block'}}
        />
      </div>
      <div style={{height: '1px', background: 'rgba(245,243,238,0.08)', marginRight: '-1rem', marginBottom: '1.5rem'}} />
      <TOCItems
        {...props}
        linkClassName={LINK_CLASS_NAME}
        linkActiveClassName={LINK_ACTIVE_CLASS_NAME}
      />
    </div>
  );
}