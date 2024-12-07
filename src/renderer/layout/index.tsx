import { observer } from 'mobx-react-lite';

import Breadcrumb from '../components/Breadcrumb';
import Cover from '../components/Cover';
import loadingStore from '../core/stores/LoadingStore';
import useKeydownEvents from '../hooks/useKeydownEvents';
import { UserAuthSection, UserDropdownMenu } from '../modules/auth';
import { AppAside } from './AppAside';
import GridOverlay from './GridOverlay';
import { Header } from './Header';
import NavigationMenu from './NavigationMenu';

interface MainLayoutProps {
  children?: React.ReactNode;
  appName?: string; // Optional prop for dynamic app name
}

/**
 * MainLayout component acts as the main layout structure for the application.
 * It includes the header, aside, navigation menu, and a content area.
 *
 * @param {MainLayoutProps} props - The props for the layout, including optional children and app name.
 * @returns {JSX.Element} The rendered main layout component.
 */
function MainLayout({
  children,
  appName = 'HarmOni',
}: MainLayoutProps): JSX.Element {
  useKeydownEvents();
  return (
    <>
      <Header name={appName} />
      <AppAside />

      <main className="app-main">
        <Cover />
        {loadingStore.allModulesLoaded && (
          <>
            <UserAuthSection />
            <section className="section" style={{ height: '100vh' }}>
              <NavigationMenu />
              <div className="content">
                <Breadcrumb avatar={<UserDropdownMenu />} />
                <div className="main">{children}</div>
              </div>
            </section>
          </>
        )}
      </main>
      <GridOverlay />
    </>
  );
}

export default observer(MainLayout);
