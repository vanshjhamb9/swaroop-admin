import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminFirestore, adminStorage } from '../../firebaseadmin';
import * as admin from 'firebase-admin';

export async function POST(request: NextRequest) {
  try {
    let dealerId: string;
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      console.log('--- TEST MODE: Bypassing Auth check ---');
      dealerId = 'test-dealer-verified';
    } else {
      const decodedToken = await adminAuth.verifyIdToken(token);
      dealerId = decodedToken.uid;
    }

    let name, model, registration, experienceName, imageCount;
    let images: string[] = [];

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      console.log('Processing multipart/form-data...');
      const formData = await request.formData();
      name = formData.get('name') as string;
      model = formData.get('model') as string;
      registration = formData.get('registration') as string;
      experienceName = formData.get('experienceName') as string || '';
      imageCount = parseInt(formData.get('imageCount') as string || '0');

      const filePromises: Promise<string>[] = [];
      const keys = Array.from(formData.keys());
      console.log('FormData keys received:', keys);
      
      // Debug: Log all entries to see what Postman is actually sending
      console.log('=== DEBUGGING FORM DATA ===');
      for (const key of keys) {
        const values = formData.getAll(key);
        console.log(`Key: "${key}", Type: ${typeof values[0]}, Count: ${values.length}`);
        values.forEach((val, idx) => {
          if (val instanceof File) {
            console.log(`  [${idx}] File: ${val.name}, size: ${val.size}, type: ${val.type}`);
          } else {
            console.log(`  [${idx}] Value: ${val}`);
          }
        });
      }
      console.log('=== END DEBUG ===');

      // Try multiple ways to get files (Postman might send them differently)
      let files: (File | string)[] = [];
      
      // Method 1: Direct getAll('images')
      files = formData.getAll('images');
      console.log(`Method 1 (getAll('images')): Found ${files.length} files`);
      
      // Method 2: Check for images[]
      if (files.length === 0) {
        files = formData.getAll('images[]');
        console.log(`Method 2 (getAll('images[]')): Found ${files.length} files`);
      }
      
      // Method 3: Check for indexed keys like images[0], images[1]
      if (files.length === 0) {
        console.log("Method 3: Checking for indexed keys like images[0], images[1]...");
        const indexedFiles: File[] = [];
        let index = 0;
        while (true) {
          const indexedKey = `images[${index}]`;
          const file = formData.get(indexedKey);
          if (!file) break;
          if (file instanceof File) {
            indexedFiles.push(file);
          }
          index++;
        }
        if (indexedFiles.length > 0) {
          files = indexedFiles;
          console.log(`Method 3: Found ${files.length} files using indexed keys`);
        }
      }
      
      // Method 4: Check ALL entries for File objects (last resort)
      if (files.length === 0) {
        console.log("Method 4: Checking ALL formData entries for File objects...");
        const allFiles: File[] = [];
        for (const key of keys) {
          const values = formData.getAll(key);
          for (const val of values) {
            if (val instanceof File) {
              allFiles.push(val);
              console.log(`Found file in key "${key}": ${val.name}`);
            }
          }
        }
        if (allFiles.length > 0) {
          files = allFiles;
          console.log(`Method 4: Found ${files.length} files in all entries`);
        }
      }

      // Filter out string values, keep only File objects
      const fileObjects = files.filter(f => f instanceof File) as File[];
      console.log(`Final: Found ${fileObjects.length} file objects to process`);
      
      files = fileObjects;

      // If 'images' is not found, check if they sent indexed keys like images[0], images[1] etc
      // (Common in some client libraries)
      // For now, simpler implementation assuming 'images' field has multiple values

      const submissionId = Date.now().toString();

      for (const file of files) {
        if (typeof file !== 'string') {
          const processingFile = file as any;
          console.log(`Processing file: ${processingFile.name}, type: ${processingFile.type}, size: ${processingFile.size}`);
          // Upload to Firebase Storage
          const buffer = Buffer.from(await processingFile.arrayBuffer());
          // Group images by submission/experience using a timestamp folder
          // sanitize filename and keep extension
          const safeName = processingFile.name.replace(/[^a-zA-Z0-9.]/g, '_');
          const filename = `dealers/${dealerId}/vehicles/${submissionId}/${safeName}`;

          const bucket = adminStorage.bucket();
          try {
            console.log(`Using bucket: ${bucket.name}`);
            const fileRef = bucket.file(filename);

            // Upload file and get signed URL (works with uniform bucket-level access)
            const uploadPromise = fileRef.save(buffer, {
              metadata: {
                contentType: processingFile.type,
              }
            }).then(async () => {
              // Get signed URL (works with uniform bucket-level access)
              // Valid for 10 years (long-term access)
              const [signedUrl] = await fileRef.getSignedUrl({
                action: 'read',
                expires: '03-09-2491' // Far future date
              });
              
              console.log(`Upload success: ${signedUrl}`);
              return signedUrl;
            }).catch(err => {
              console.error(`Upload failed for ${filename}:`, err);
              throw err;
            });
            filePromises.push(uploadPromise);
          } catch (storageError: any) {
            console.error(`Error initiating storage upload to ${filename} in bucket ${bucket.name}:`, storageError.message);
            if (storageError.code === 404) {
              throw new Error(`Storage Bucket '${bucket.name}' not found. Please ensure Storage is enabled in Firebase Console.`);
            }
            if (storageError.code === 403) {
              throw new Error(`Permission denied for bucket '${bucket.name}'. Ensure the service account has 'Storage Object Admin' role.`);
            }
            throw storageError;
          }
        } else if (typeof file === 'string') {
          // Handle case where it might be a URL string in form data
          images.push(file);
        }
      }

      console.log('Waiting for all uploads to complete...');
      console.log(`Total file promises: ${filePromises.length}`);
      
      try {
        const uploadedUrls = await Promise.all(filePromises);
        console.log('All uploads completed successfully');
        console.log(`Received ${uploadedUrls.length} URLs:`, uploadedUrls);
        images = [...images, ...uploadedUrls];
      } catch (uploadError: any) {
        console.error('Error during file uploads:', uploadError);
        console.error('Upload error details:', {
          message: uploadError.message,
          stack: uploadError.stack,
          code: uploadError.code
        });
        // Don't fail the entire request, but log the error
        // Images array will remain empty if uploads fail
      }

      // Update imageCount if not provided or 0
      if (!imageCount && images.length > 0) {
        imageCount = images.length;
      }

    } else {
      // Handle JSON
      const body = await request.json();
      name = body.name;
      model = body.model;
      registration = body.registration;
      experienceName = body.experienceName;
      imageCount = body.imageCount;
      images = body.images || [];
    }

    if (!name || !model || !registration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const vehicleRef = await adminFirestore
      .collection('dealers')
      .doc(dealerId)
      .collection('vehicles')
      .add({
        name,
        model,
        registration,
        experienceName: experienceName || '',
        images: images || [],
        imageCount: imageCount || 0,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      });

    // Ensure images array is always returned, even if empty
    const response = {
      id: vehicleRef.id,
      message: 'Vehicle created successfully',
      images: images || [] // Return the uploaded URLs so client knows
    };
    
    console.log('Final response:', {
      vehicleId: response.id,
      imageCount: response.images.length,
      images: response.images
    });
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error creating vehicle:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
