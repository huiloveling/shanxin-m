import React from 'react';
import Link from 'umi/link';
import Exception from '@/components/Exception';

export default () => (
  <Exception
    type="404"
    linkElement={Link}
    desc={{ id: 'app.exception.description.404' }}
    backText={{ id: 'app.exception.back' }}
  />
);
