import { CustomPointer } from '@components/CustomPointer';
import { Toaster } from '@components/Toaster';
import { NavigationProvider } from '@contexts/NavigationContext';
import Layout from '@layout/index';
import ActiveTabRenderer from '@navigation/ActiveTabRenderer';

/**
 * Main application component that sets up context providers,
 * layout, and active tab rendering.
 *
 * @returns {JSX.Element} The rendered App component.
 */
export default function App() {
  return (
    <div>
      <CustomPointer />

      <NavigationProvider>
        <Layout>
          {/* Renders the currently active tab based on the navigation context */}
          <ActiveTabRenderer />
        </Layout>
      </NavigationProvider>
      <Toaster />
    </div>
  );
}
