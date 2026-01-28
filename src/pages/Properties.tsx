import { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Home, Plus, Eye, Trash2, MapPin, Wifi, Car, Droplets, ImagePlus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { SearchFilterBar } from '@/components/SearchFilterBar';
import { StatusBadge, getStatusVariant } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useProperties, PropertyDB } from '@/hooks/useProperties';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { convertFileToBase64 } from '@/utils/agencySettings';

const facilityIcons: Record<string, React.ElementType> = {
  Wifi: Wifi,
  Parking: Car,
  Water: Droplets,
};

const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { properties, isLoading, addProperty, deleteProperty } = useProperties();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [maxRent, setMaxRent] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<PropertyDB | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Auto-open form when action=add is in URL
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setIsFormOpen(true);
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Form state with landlord info inline
  const [formData, setFormData] = useState({
    type: 'Room' as string,
    location: '',
    rentAmount: '',
    description: '',
    facilities: [] as string[],
    photos: [] as string[],
    remarks: '',
    landlordName: '',
    landlordPhone: '',
    landlordAddress: '',
  });
  
  const [viewImageIndex, setViewImageIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const matchesSearch =
        (property.location?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        property.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (property.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      const matchesType = typeFilter === 'all' || property.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
      const matchesRent = !maxRent || property.rent_amount <= parseInt(maxRent);

      return matchesSearch && matchesType && matchesStatus && matchesRent;
    });
  }, [properties, searchQuery, typeFilter, statusFilter, maxRent]);

  const handleAddProperty = () => {
    if (!formData.location || !formData.rentAmount || !formData.landlordName) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in location, rent, and landlord name',
        variant: 'destructive',
      });
      return;
    }

    addProperty.mutate({
      landlord_name: formData.landlordName,
      landlord_phone: formData.landlordPhone || null,
      landlord_address: formData.landlordAddress || null,
      type: formData.type,
      location: formData.location || null,
      rent_amount: parseInt(formData.rentAmount),
      facilities: formData.facilities,
      photos: formData.photos,
      status: 'Vacant',
      description: formData.description || null,
      remarks: formData.remarks || null,
    });

    setIsFormOpen(false);
    setFormData({
      type: 'Room',
      location: '',
      rentAmount: '',
      description: '',
      facilities: [],
      photos: [],
      remarks: '',
      landlordName: '',
      landlordPhone: '',
      landlordAddress: '',
    });
  };

  const handleDeleteProperty = (id: string) => {
    deleteProperty.mutate(id);
  };

  const toggleFacility = (facility: string) => {
    setFormData((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter((f) => f !== facility)
        : [...prev.facilities, facility],
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 3 - formData.photos.length;
    if (remainingSlots <= 0) {
      toast({
        title: 'Maximum Photos',
        description: 'You can only upload up to 3 photos per property.',
        variant: 'destructive',
      });
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    
    for (const file of filesToUpload) {
      try {
        const base64 = await convertFileToBase64(file);
        setFormData((prev) => ({
          ...prev,
          photos: [...prev.photos, base64],
        }));
      } catch (error) {
        toast({
          title: 'Upload Failed',
          description: 'Failed to upload image. Please try again.',
          variant: 'destructive',
        });
      }
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageHeader
          title="Properties"
          description="Manage rental listings and vacancies"
          icon={Home}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Properties"
        description="Manage rental listings and vacancies"
        icon={Home}
        action={{
          label: 'Add Property',
          onClick: () => setIsFormOpen(true),
          icon: Plus,
        }}
      />

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <SearchFilterBar
            searchPlaceholder="Search by location or type..."
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            className="mb-0"
          />
        </div>
        <div className="flex gap-3">
          <div className="w-32">
            <Input
              type="number"
              placeholder="Max Rent"
              value={maxRent}
              onChange={(e) => setMaxRent(e.target.value)}
              className="bg-card"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32 bg-card">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Room">Room</SelectItem>
              <SelectItem value="Flat">Flat</SelectItem>
              <SelectItem value="Shutter">Shutter</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 bg-card">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Vacant">Vacant</SelectItem>
              <SelectItem value="Occupied">Occupied</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProperties.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No properties found matching your criteria
          </div>
        ) : (
          filteredProperties.map((property, index) => (
            <div
              key={property.id}
              className={cn(
                'bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-all duration-300',
                'animate-fade-in'
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Property Image */}
              <div className="h-40 relative overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                {property.photos && property.photos.length > 0 ? (
                  <img
                    src={property.photos[0]}
                    alt={`${property.type} at ${property.location}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Home className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                )}
                {property.photos && property.photos.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                    +{property.photos.length - 1} more
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{property.type}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {property.location}
                    </div>
                  </div>
                  <StatusBadge
                    status={property.status}
                    variant={getStatusVariant(property.status)}
                  />
                </div>

                <p className="text-xl font-bold text-primary mb-3">
                  NPR {property.rent_amount.toLocaleString()}
                  <span className="text-sm font-normal text-muted-foreground">/month</span>
                </p>

                {property.facilities && property.facilities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {property.facilities.slice(0, 4).map((facility) => {
                      const Icon = facilityIcons[facility] || Droplets;
                      return (
                        <span
                          key={facility}
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-muted rounded-md text-muted-foreground"
                        >
                          <Icon className="h-3 w-3" />
                          {facility}
                        </span>
                      );
                    })}
                  </div>
                )}

                {property.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {property.description}
                  </p>
                )}

                <div className="flex gap-2 pt-3 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedProperty(property);
                      setViewImageIndex(0);
                      setIsViewOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteProperty(property.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Property Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Property</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Landlord Info Section */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-4">
              <h4 className="font-medium text-foreground">Landlord Details</h4>
              <div className="space-y-2">
                <Label>Landlord Name *</Label>
                <Input
                  placeholder="e.g., Hari Prasad Sharma"
                  value={formData.landlordName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, landlordName: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    placeholder="+977-98XXXXXXXX"
                    value={formData.landlordPhone}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, landlordPhone: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input
                    placeholder="e.g., New Road, Pokhara"
                    value={formData.landlordAddress}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, landlordAddress: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Property Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Room">Room</SelectItem>
                    <SelectItem value="Flat">Flat</SelectItem>
                    <SelectItem value="Shutter">Shutter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Monthly Rent (NPR) *</Label>
                <Input
                  type="number"
                  placeholder="e.g., 12000"
                  value={formData.rentAmount}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, rentAmount: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Location *</Label>
              <Input
                placeholder="e.g., New Road, Pokhara"
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Facilities</Label>
              <div className="flex flex-wrap gap-4">
                {['Water', 'Wifi', 'Parking', 'Electricity', 'Garden'].map((facility) => (
                  <label
                    key={facility}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={formData.facilities.includes(facility)}
                      onCheckedChange={() => toggleFacility(facility)}
                    />
                    <span className="text-sm">{facility}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Additional details about the property..."
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>

            {/* Photo Upload Section */}
            <div className="space-y-2">
              <Label>Property Photos (Max 3)</Label>
              <div className="flex flex-wrap gap-3">
                {formData.photos.map((photo, index) => (
                  <div
                    key={index}
                    className="relative w-20 h-20 rounded-lg overflow-hidden border border-border"
                  >
                    <img
                      src={photo}
                      alt={`Property photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 p-0.5 bg-destructive rounded-full text-white hover:bg-destructive/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {formData.photos.length < 3 && (
                  <label className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <ImagePlus className="h-6 w-6 text-muted-foreground" />
                  </label>
                )}
              </div>
            </div>

            {/* Remarks */}
            <div className="space-y-2">
              <Label>Remarks (Internal Notes)</Label>
              <Textarea
                placeholder="Any internal notes about this property..."
                value={formData.remarks}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, remarks: e.target.value }))
                }
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddProperty} disabled={addProperty.isPending}>
                {addProperty.isPending ? 'Adding...' : 'Add Property'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Property Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Property Details</DialogTitle>
          </DialogHeader>

          {selectedProperty && (
            <div className="space-y-6">
              {/* Image Gallery */}
              {selectedProperty.photos && selectedProperty.photos.length > 0 && (
                <div className="relative">
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <img
                      src={selectedProperty.photos[viewImageIndex]}
                      alt={`${selectedProperty.type} at ${selectedProperty.location}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {selectedProperty.photos.length > 1 && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2"
                        onClick={() =>
                          setViewImageIndex((prev) =>
                            prev === 0 ? selectedProperty.photos!.length - 1 : prev - 1
                          )
                        }
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() =>
                          setViewImageIndex((prev) =>
                            prev === selectedProperty.photos!.length - 1 ? 0 : prev + 1
                          )
                        }
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {selectedProperty.photos.map((_, index) => (
                          <button
                            key={index}
                            className={cn(
                              'w-2 h-2 rounded-full transition-colors',
                              index === viewImageIndex
                                ? 'bg-primary'
                                : 'bg-white/50 hover:bg-white/80'
                            )}
                            onClick={() => setViewImageIndex(index)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">
                      {selectedProperty.type}
                    </h3>
                    <div className="flex items-center gap-1 text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4" />
                      {selectedProperty.location}
                    </div>
                  </div>

                  <div>
                    <p className="text-3xl font-bold text-primary">
                      NPR {selectedProperty.rent_amount.toLocaleString()}
                      <span className="text-base font-normal text-muted-foreground">
                        /month
                      </span>
                    </p>
                  </div>

                  <StatusBadge
                    status={selectedProperty.status}
                    variant={getStatusVariant(selectedProperty.status)}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Landlord</p>
                    <p className="font-medium">{selectedProperty.landlord_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedProperty.landlord_phone}
                    </p>
                  </div>

                  {selectedProperty.facilities && selectedProperty.facilities.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Facilities</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedProperty.facilities.map((facility) => {
                          const Icon = facilityIcons[facility] || Droplets;
                          return (
                            <span
                              key={facility}
                              className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-muted rounded-md"
                            >
                              <Icon className="h-4 w-4" />
                              {facility}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedProperty.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p className="text-foreground">{selectedProperty.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Properties;
