import React, { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import copy from 'copy-to-clipboard';
import _ from 'lodash';

// Removed inline style - using Tailwind classes instead

const UrlBasedColumnItem = ({ url }: { url: string }) => {
  const getView = useCallback(() => {
    if (_.isUndefined(url) || _.isNull(url)) return null;

    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const videoExtensions = ['mp4', 'webm'];
    const docExtensions = ['.pdf'];
    const extensions = [...imageExtensions, ...videoExtensions, ...docExtensions];

    for (let i = 0; i < _.size(extensions); i++) {
      // console.debug({ extension: extensions[i] });

      if (
        !_.isUndefined(url) &&
        !_.isNull(url) &&
        _.includes(url.toLowerCase(), '.' + extensions[i]) &&
        _.includes(imageExtensions, extensions[i])
      ) {
        return (
          <a href={url} target="_blank" rel="noreferrer" className="w-[100px] h-auto overflow-auto">
            <img src={url} width={100} alt="Preview" />
          </a>
        );
      } else if (
        !_.isUndefined(url) &&
        !_.isNull(url) &&
        extensions[i] !== undefined &&
        _.includes(url.toLowerCase(), '.' + extensions[i]) &&
        videoExtensions.includes(extensions[i]!)
      ) {
        return (
          <a href={url} target="_blank" rel="noreferrer" className="w-[100px] h-auto overflow-auto">
            <video src={url} width={100} />
          </a>
        );
      }
    }

    return (
      <a href={url} target="_blank" rel="noreferrer" className="w-[100px] h-auto overflow-auto">
        {url}
      </a>
    );
  }, [url]);

  return useMemo(
    () => (
      <div className="flex-auto">
        {_.isUndefined(url) || _.isNull(url) ? null : getView()}
        <br />
        {_.isUndefined(url) || _.isNull(url) || _.isEqual(url, '') ? null : (
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-[100px]"
            onClick={e => {
              e.preventDefault();

              copy(url);
            }}
          >
            Copy Link
          </Button>
        )}
      </div>
    ),
    [],
  );
};

export default UrlBasedColumnItem;
