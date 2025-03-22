import './style.css';

import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';

import loadingStore from '@core/stores/LoadingStore';

const Cover = observer((): JSX.Element => {
  useEffect(() => {
    let hideCoverAfterDelay: NodeJS.Timeout | undefined;
    let removeLoadingStateAfterDelay: NodeJS.Timeout | undefined;

    // When all modules are loaded, hide the cover and remove loading state
    if (loadingStore.allModulesLoaded) {
      hideCoverAfterDelay = setTimeout(() => {
        document.body.classList.remove('cover--is--visible');
      }, 1750);

      removeLoadingStateAfterDelay = setTimeout(() => {
        document.body.classList.remove('is--loading');
      }, 3250);
    }

    // Cleanup timeout on component unmount
    return () => {
      clearTimeout(hideCoverAfterDelay);
      clearTimeout(removeLoadingStateAfterDelay);
    };
  }, [loadingStore.allModulesLoaded]);

  return (
    <section className="section cover">
      <div className="content">
        <div>
          <h1>HarmOni </h1>
          <br />
          <h2>—Your all-in-one entertainment hub</h2>
        </div>
      </div>
    </section>
  );
});

export default Cover;
