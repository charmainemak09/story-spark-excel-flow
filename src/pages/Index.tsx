
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";

const Index = () => {
  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            User Story Mapper
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Organize and visualize your user stories with ease
          </p>
          <div className="bg-white rounded-lg shadow-md p-8">
            <p className="text-gray-700">
              Welcome to your User Story Mapping tool! This is where you'll be able to create, organize, and manage your user stories.
            </p>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Index;
