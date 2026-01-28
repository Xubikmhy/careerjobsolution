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
import { mockProperties } from '@/data/mockData';
import { Property, LandlordInfo } from '@/types';
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
  const [properties, setProperties] = useState<Property[]>(mockProperties);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [maxRent, setMaxRent] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
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
    type: 'Room' as Property['type'],
    location: '',
    rentAmount: '',
    description: '',
    facilities: [] as string[],
    photos: [] as string[],
    remarks: '',
    // Landlord info
    landlordName: '',
    landlordPhone: '',
    landlordAddress: '',
  });
  
  const [viewImageIndex, setViewImageIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const matchesSearch =
        property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (property.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      const matchesType = typeFilter === 'all' || property.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
      const matchesRent = !maxRent || property.rentAmount <= parseInt(maxRent);

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

    const landlordInfo: LandlordInfo = {
      fullName: formData.landlordName,
      phone: formData.landlordPhone,
      address: formData.landlordAddress,
    };

    const newProperty: Property = {
      id: String(Date.now()),
      landlordInfo,
      type: formData.type,
      location: formData.location,
      rentAmount: parseInt(formData.rentAmount),
      facilities: formData.facilities,
      photos: formData.photos,
      status: 'Vacant',
      description: formData.description,
      remarks: formData.remarks || undefined,
      createdAt: new Date(),
    };

    setProperties([newProperty, ...properties]);
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

    toast({
      title: 'Property Added',
      description: 'The property has been added successfully.',
    });
  };

  const handleDeleteProperty = (id: string) => {
    setProperties(properties.filter((p) => p.id !== id));
    toast({
      title: 'Property Deleted',
      description: 'The property has been removed.',
    });
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
    
    // Reset input
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
                  NPR {property.rentAmount.toLocaleString()}
                  <span className="text-sm font-normal text-muted-foreground">/month</span>
                </p>

                {property.facilities.length > 0 && (
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
                    setFormData((prev) => ({ ...prev, type: value as Property['type'] }))
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
                  <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-border">
                    <img src={photo} alt={`Property photo ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 hover:opacity-80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {formData.photos.length < 3 && (
                  <label className="w-24 h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                    <ImagePlus className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">Add Photo</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                    />
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
              <Button onClick={handleAddProperty}>Add Property</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Property Modal */}
      <Dialog open={isViewOpen} onOpenChange={(open) => {
        setIsViewOpen(open);
        if (!open) setViewImageIndex(0);
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Property Details</DialogTitle>
          </DialogHeader>
          {selectedProperty && (
            <div className="space-y-4">
              {/* Image Gallery */}
              {selectedProperty.photos && selectedProperty.photos.length > 0 ? (
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src={selectedProperty.photos[viewImageIndex]}
                    alt={`${selectedProperty.type} photo ${viewImageIndex + 1}`}
                    className="w-full h-48 object-cover"
                  />
                  {selectedProperty.photos.length > 1 && (
                    <>
                      <button
                        onClick={() => setViewImageIndex((prev) => (prev === 0 ? selectedProperty.photos.length - 1 : prev - 1))}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-1 rounded-full hover:bg-black/80"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setViewImageIndex((prev) => (prev === selectedProperty.photos.length - 1 ? 0 : prev + 1))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-1 rounded-full hover:bg-black/80"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {selectedProperty.photos.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setViewImageIndex(idx)}
                            className={cn(
                              "w-2 h-2 rounded-full transition-colors",
                              idx === viewImageIndex ? "bg-white" : "bg-white/50"
                            )}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                  <Home className="h-12 w-12 text-muted-foreground/50" />
                </div>
              )}

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {selectedProperty.type}
                  </h3>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {selectedProperty.location}
                  </div>
                </div>
                <StatusBadge
                  status={selectedProperty.status}
                  variant={getStatusVariant(selectedProperty.status)}
                />
              </div>

              <div className="text-2xl font-bold text-primary">
                NPR {selectedProperty.rentAmount.toLocaleString()}
                <span className="text-sm font-normal text-muted-foreground">/month</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Landlord</p>
                  <p className="font-medium">{selectedProperty.landlordInfo.fullName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Contact</p>
                  <p className="font-medium">{selectedProperty.landlordInfo.phone}</p>
                </div>
              </div>

              {selectedProperty.facilities.length > 0 && (
                <div>
                  <p className="text-muted-foreground text-sm mb-2">Facilities</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProperty.facilities.map((facility) => (
                      <span
                        key={facility}
                        className="px-3 py-1 text-sm bg-secondary rounded-md text-secondary-foreground"
                      >
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedProperty.description && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Description</p>
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
